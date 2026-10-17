from interpreter import interpreter
from interpreter import OpenInterpreter
import os
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import uuid
import litellm
import asyncio

app = FastAPI()


class TaskDesc(BaseModel):
    task_desc: str
    model: str


class MemoryAdded(BaseModel):
    role: str
    content: str


interpreter.auto_run = True


def non_streaming_litellm_completions(**params):
    """Adapt a non-streaming OpenAI-compatible response for Open Interpreter."""
    params["stream"] = False
    params.setdefault("timeout", 60)
    params.setdefault("num_retries", 0)
    params.setdefault("max_retries", 0)
    response = litellm.completion(**params)
    content = response.choices[0].message.content
    if not content:
        raise ValueError("Open Interpreter received an empty model response")
    for char in content:
        yield {"choices": [{"delta": {"content": char}}]}


def build_conclusion(messages):
    """Summarize one execution without asking the interpreter to run again."""
    final_message = next(
        (
            item["content"].strip()
            for item in reversed(messages)
            if item.get("role") == "assistant"
            and item.get("type") == "message"
            and item.get("content", "").strip()
        ),
        "",
    )

    last_code_index = next(
        (
            index
            for index in range(len(messages) - 1, -1, -1)
            if messages[index].get("role") == "assistant"
            and messages[index].get("type") == "code"
            and messages[index].get("content", "").strip()
        ),
        None,
    )

    parts = [final_message] if final_message else []
    if last_code_index is not None:
        code_message = messages[last_code_index]
        code = code_message["content"].strip()
        if code not in final_message:
            language = code_message.get("format", "")
            parts.append(f"Executed code:\n```{language}\n{code}\n```")

        output = "\n".join(
            item.get("content", "").strip()
            for item in messages[last_code_index + 1 :]
            if item.get("role") == "computer"
            and item.get("type") == "console"
            and item.get("content", "").strip()
        )
        if output and output not in final_message:
            parts.append(f"Output:\n```\n{output}\n```")

    if not parts:
        raise ValueError("Open Interpreter returned no final message or executed code")
    return "\n\n".join(parts)


@app.post("/run")
async def run(task_desc: TaskDesc):
    interpreter_instance = OpenInterpreter()
    interpreter_instance.llm.completions = non_streaming_litellm_completions
    interpreter_instance.llm.supports_functions = False
    interpreter_instance.system_message += (
        "Just run automatically without asking for user's confirmation or feedback until the task is totally completed."
    )
    interpreter_instance.messages = []
    interpreter_instance.auto_run = True
    interpreter_instance.force_task_completion = True
    interpreter_instance.llm.api_key = os.environ.get("OPENAI_API_KEY")
    interpreter_instance.llm.api_base = os.environ.get("OPENAI_BASE_URL")

    if not task_desc.model.strip():
        raise HTTPException(status_code=400, detail="Open Interpreter model must be configured")
    interpreter_instance.llm.model = task_desc.model
    print(f"interpreter model: {interpreter_instance.llm.model}...")
    task_desc.task_desc = "Here is a task that you should finish:\n" + task_desc.task_desc
    try:
        await safe_chat(interpreter_instance, task_desc.task_desc)
        messages = interpreter_instance.messages
        conclusion = build_conclusion(messages)
    except Exception as e:
        return {
            "task_id": uuid.uuid4().hex,
            "conclusion": "Internal Server Error! The task is not completed!",
        }

    del interpreter_instance
    return {
        "task_id": uuid.uuid4().hex,
        "task_desc": task_desc,
        "steps": messages,
        "conclusion": conclusion,
    }


async def safe_chat(interpreter_instance, message):
    max_retries = 3
    retries = 0
    messages = interpreter_instance.messages

    while retries < max_retries:
        try:
            interpreter_instance.messages = messages
            response = await asyncio.to_thread(interpreter_instance.chat, message, display=False)
            return response
        except Exception as e:
            print(f"An error occurred: {e}. Retrying...")
            import traceback

            traceback.print_exc()
            await asyncio.sleep(10)
            retries += 1
    raise Exception("Failed to complete the operation after several retries.")


# TODO: update get_memory, instance of interpreter should be used.
@app.post("/get_memory")
async def get_memory():
    return interpreter.messages


# TODO: update add_to_memory, instance of interpreter should be used.
@app.post("/add_to_memory")
async def add_to_memory(memoryAdded: MemoryAdded):
    interpreter.messages.append({"role": memoryAdded.role, "type": "message", "content": memoryAdded.content})


@app.post("/keep_alive")
async def keep_alive_endpoint():
    return {"message": "Keep alive endpoint"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7070)

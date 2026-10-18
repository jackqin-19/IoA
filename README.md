<h1 align="center">
    <img alt="Internet of Agents" src="https://github.com/OpenBMB/IoA/assets/32613237/04cbe3dc-84e1-4d70-ba5c-e8b07d3ee31d" style="width: 1em; height: 1em;">
    Internet of Agents
</h1>

<p align="center">
    <a href="https://discord.gg/E5XPtynFDh">
        <img alt="Discord" src="https://img.shields.io/discord/1259737237763919963?logo=discord&style=flat&logoColor=white"/>
    </a>
    <a href="https://github.com/astral-sh/ruff">
        <img alt="Code Formater: Ruff" src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json">
    </a>
    <a href="https://github.com/jackqin-19/IoA/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/jackqin-19/IoA">
    </a>
    <br>
    <br>
    【<a href="https://openbmb.github.io/IoA/">Documentation</a> |
    <a href="https://arxiv.org/abs/2407.07061">Paper</a>】
    <br>
</p>

---

## 🌎 What is Internet of Agents?

Imagine if AI agents could collaborate like humans do on the internet. That's the idea behind Internet of Agents (IoA)! It's an open-source framework that aims to create a platform where diverse AI agents can team up to tackle complex tasks.

For example, agents like [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) and [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter) can come together, share their unique skills, and work on problems that might be too tricky for a single agent to solve.

## 🚀 Key Features

- 🌐 **Internet-Inspired Architecture**: Just like how the internet connects people, IoA can connect different AI agents across different environments.
- 🤝 **Autonomous Nested Team Formation**: Agents can form teams and sub-teams on their own, adapting to complex tasks.
- 🧩 **Heterogeneous Agent Integration**: Brings together agents with different skills and backgrounds, kind of like assembling an all-star team.
- ⏳ **Asynchronous Task Execution**: Agents can multitask, making the whole system more efficient.
- 🗣️ **Adaptive Conversation Flow**: The conversation flow is autonomously managed to keep agent conversations structured but flexible.
- 🔄 **Scalable and Extensible**: Easy to add new types of agents or tackle different kinds of tasks.

For more details, please refer to [our paper](https://arxiv.org/abs/2407.07061).

<p align="center" style="color:RGB(160, 160, 160)">
    <img src="https://github.com/OpenBMB/IoA/assets/32613237/126082a8-432b-4039-8acd-49f4798a492c">
    <br>
    A peek at IoA's layered architecture
</p>

<p align="center" style="color:RGB(160, 160, 160)">
    <img src="https://github.com/OpenBMB/IoA/assets/32613237/6d081cd8-a935-4e34-a24d-62eb65f8c6ec">
    <br>
    How IoA works
</p>

---

## 🔬 Research Version

This repository is a personal research fork of IoA for undergraduate thesis and subsequent research experiments.

The main purpose of this version is to reproduce the original IoA system locally and provide a foundation for further improvements to multi-agent collaboration.

### Current Modifications

- 🔧 Updated the Open Instruction agent configurations.
- 🤖 Updated the LLM configuration for AutoGPT and Open Interpreter.
- 🌐 Added support for OpenAI-compatible API endpoints through environment variables.
- 🐳 Preserved the original Docker-based deployment architecture.
- 🧪 Verified the basic multi-agent collaboration workflow between AutoGPT and Open Interpreter.
- Integrated ReAct as a third Open Instruction agent and verified its standalone code execution.
- Verified that AutoGPT, Open Interpreter, and ReAct can exchange messages and reach a shared conclusion in one session.

The Open Instruction demo reads its model from `SMART_LLM`. Configure the model, API endpoint, and API key locally in `.env`; do not commit that file.

Future work will focus on improving agent coordination, task execution, and the overall efficiency of multi-agent collaboration.

---

## 🚀 Quick Start

Get IoA up and running in just a few steps:

### 1. 📋 Prerequisites

- Ensure you have [Docker](https://www.docker.com/) installed on your system.
- Git is recommended for cloning and managing the repository.
- Python 3.10+ is recommended for running local test scripts.

### 2. 📥 Clone the Repository

```bash
git clone https://github.com/jackqin-19/IoA.git
cd IoA
```

If you are working on the original repository instead, you can clone it with:

```bash
git clone https://github.com/OpenBMB/IoA.git
cd IoA
```

### 3. 🏗️ Build Docker Images

#### Core Components

Pull the pre-built server and client images, then build the frontend from this repository to get the redesigned UI:

```bash
# Server
docker pull weize/ioa-server:latest

# Client
docker pull weize/ioa-client:latest

# Rename the images
docker tag weize/ioa-server:latest ioa-server:latest
docker tag weize/ioa-client:latest ioa-client:latest

# Redesigned frontend from this repository
docker build -f dockerfiles/server_frontend.Dockerfile -t ioa-server-frontend:latest .
```

The pre-built `weize/ioa-server-frontend:latest` image may still contain the older UI; building from source ensures you use the frontend in this checkout.

The ReAct client needs the dependency and response-parsing fixes in this checkout. Build its client image from source even if you use the pre-built image for AutoGPT and Open Interpreter:

```bash
docker build -f dockerfiles/client.Dockerfile -t ioa-client:react .
```

<details>
<summary>Or you can build from source</summary>

```bash
# Server
docker build -f dockerfiles/server.Dockerfile -t ioa-server:latest .

# Client
docker build -f dockerfiles/client.Dockerfile -t ioa-client:latest .

# Server Frontend
docker build -f dockerfiles/server_frontend.Dockerfile -t ioa-server-frontend:latest .
```

</details>

#### Agent Images (Build as needed)

For the ReAct integration in this fork, build the tool image from source:

```bash
docker build -f dockerfiles/tool_agents/react.Dockerfile -t react-agent:latest .
```

The following pre-built images remain options for the other agents:

```bash
# AutoGPT
docker pull weize/autogpt:latest
docker tag weize/autogpt:latest autogpt:latest

# Open Interpreter
docker pull weize/open-interpreter:latest
docker tag weize/open-interpreter:latest open-interpreter:latest
```

<details>
<summary>Or you can build from source</summary>

```bash
# ReAct Agent
docker build -f dockerfiles/tool_agents/react.Dockerfile -t react-agent:latest .

# AutoGPT
docker build -f dockerfiles/tool_agents/autogpt.Dockerfile -t autogpt:latest .

# Open Interpreter
docker build -f dockerfiles/tool_agents/open_interpreter.Dockerfile -t open-interpreter:latest .
```

</details>

### 4. 🌐 Launch Milvus Service

IoA uses Milvus as part of its agent registry and retrieval infrastructure.

```bash
docker network create agent_network
docker compose -f dockerfiles/compose/milvus.yaml up -d
```

If `agent_network` already exists, Docker may report that it already exists. This is normal and can be ignored.

You can check the Milvus-related containers with:

```bash
docker compose -f dockerfiles/compose/milvus.yaml ps -a
```

### 5. 🔑 Configure Environment Variables

Enter the compose directory:

```bash
cd dockerfiles/compose
```

Create your local `.env` file from the template.

On Windows:

```cmd
copy .env_template .env
```

On Linux/macOS:

```bash
cp .env_template .env
```

Then edit:

```text
dockerfiles/compose/.env
```

Fill in your own API configuration:

```env
OPENAI_API_KEY=your_api_key

OPENAI_BASE_URL=https://api.example.com/v1
OPENAI_API_BASE_URL=https://api.example.com/v1
OPENAI_API_BASE=https://api.example.com/v1

SMART_LLM=your_openai_compatible_model

OPENAI_RESPONSE_LOG_PATH=/app/openai_response_log
```

The API endpoint should provide an OpenAI-compatible interface.

For the Open Instruction demo, `SMART_LLM` selects the model for both agent collaboration and tool execution. Change this one value to switch models.

> ⚠️ **Important:** Do not commit `.env` to Git. It may contain private API credentials.

### 6. 🎬 Start IoA

Return to the repository root:

```bash
cd ../../
```

Start the Open Instruction demo:

```bash
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml up -d
```

Check the status of all services:

```bash
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml ps -a
```

A successful deployment should contain services such as:

```text
autogpt-client
open-interpreter-client
react-client
react-open-instruction-agent
ioa-server
server_frontend
milvus-standalone
milvus-etcd
milvus-minio
attu
```

### 7. 🌐 Access the Services

The default ports are:

```text
Frontend:          http://127.0.0.1
IoA Server:        http://127.0.0.1:7788
AutoGPT Client:    http://127.0.0.1:5050
Open Interpreter:  http://127.0.0.1:5051
ReAct Client:      http://127.0.0.1:5052
Attu:              http://127.0.0.1:8000
```

The web frontend can be accessed through:

```text
http://127.0.0.1
```

---

## 🧪 Test It Out

Once the containers are running, you can send a goal to the AutoGPT client.

For example:

```cmd
curl -X POST http://127.0.0.1:5050/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"Calculate 12345 times 6789 and give the final result.\",\"max_turns\":2,\"team_member_names\":[\"AutoGPT\",\"Open Interpreter\"]}"
```

A successful request should return the task identifier and the final result:

```text
12345 × 6789 = 83,810,205
```

You can also test a more meaningful multi-agent task:

```cmd
curl -X POST http://127.0.0.1:5050/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"请分析人工智能 Agent 和 Multi-Agent System 的区别，并分别给出一个实际应用例子。\",\"max_turns\":3,\"team_member_names\":[\"AutoGPT\",\"Open Interpreter\"]}"
```

The `team_member_names` field specifies which agents participate in the task.

When it is left as `None`, the agent can decide whether to form a team autonomously.

To test ReAct on its own, send one request to its client on port 5052:

```cmd
curl -X POST http://127.0.0.1:5052/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"Use the code execution tool to evaluate sum(range(1, 11)) and report the integer output.\",\"team_member_names\":[\"ReAct\"]}"
```

To test all three agents in one session:

```cmd
curl -X POST http://127.0.0.1:5052/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"As a team, calculate the sum of the integers from 1 through 10 and explain the result. Ask each member to contribute before concluding.\",\"team_member_names\":[\"AutoGPT\",\"Open Interpreter\",\"ReAct\"]}"
```

In the verified three-agent run, all three agents sent messages in the same session and the final conclusion was `55`. That run used discussion messages; it did not establish that Open Interpreter actually invoked its code execution tool. Verify tool use from the relevant tool-container logs rather than the agent's written claim. A timed-out HTTP request may continue running in the background, so inspect the session record before retrying.

---

## 🤝 How Multi-Agent Collaboration Works

IoA allows multiple agents to cooperate on a shared goal.

For example:

```text
                         User Goal
                            │
                            ▼
                    ┌───────────────┐
                    │      IoA      │
                    │ Coordination  │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
          ┌───────────┐           ┌───────────────┐
          │  AutoGPT  │           │Open Interpreter│
          │ Reasoning │           │ Code / Tools  │
          └─────┬─────┘           └──────┬────────┘
                │                        │
                └───────────┬────────────┘
                            ▼
                       Final Result
```

Different agents can contribute different capabilities to the same task.

For example:

- **AutoGPT** can focus on reasoning, planning, and task coordination.
- **Open Interpreter** can execute code and interact with tools.
- **ReAct** can reason through a task and call its code execution tool.
- **IoA** provides the communication and coordination infrastructure between agents.

This allows the system to solve tasks collaboratively rather than relying entirely on a single agent.

---

## 🧪 Test with Python

You can also send a request using Python:

```python
import requests

goal = "I want to know the annual revenue of Microsoft from 2014 to 2020. Please generate a figure in text format showing the trend of the annual revenue, and give me an analysis report."

response = requests.post(
    "http://127.0.0.1:5050/launch_goal",
    json={
        "goal": goal,
        "max_turns": 20,
        "team_member_names": ["AutoGPT", "Open Interpreter"],
    },
)

print(response.text)
```

You can also run the original Open Instruction evaluation script:

```bash
python scripts/open_instruction/test_open_instruction.py
```

---

## 🛠️ Useful Docker Commands

### Check all containers

```bash
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml ps -a
```

### View AutoGPT logs

```bash
docker logs -f autogpt-client
```

### View Open Interpreter logs

```bash
docker logs -f open-interpreter-client
```

### View ReAct logs

```bash
docker logs -f react-client
docker logs -f react-open-instruction-agent
```

### View IoA server logs

```bash
docker logs -f ioa-server
```

### View the frontend logs

```bash
docker logs -f server_frontend
```

### Stop the Open Instruction demo

```bash
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml down
```

### Start the Open Instruction demo again

```bash
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml up -d
```

### Check whether a container is running

```bash
docker ps
```

---

## 🔧 Configuration

The Open Instruction configuration can be found at:

```text
configs/client_configs/cases/open_instruction/
```

The main agent configurations are:

```text
autogpt.yaml
open_interpreter.yaml
react.yaml
```

The Open Instruction agent configs read their LLM model from `SMART_LLM` in `.env`.

For example:

```yaml
llm:
  llm_type: openai-chat
  model: ${SMART_LLM}
  temperature: 0.1
```

The API key and API endpoint should be configured through:

```text
dockerfiles/compose/.env
```

rather than being hard-coded into the source code.

---

## 🔬 Future Research

This repository will serve as the foundation for further research on **multi-agent systems and agent collaboration**.

Potential research directions include:

- 🧠 **Improved Agent Coordination**
- 🤝 **More Efficient Multi-Agent Collaboration**
- 🧩 **Dynamic Agent Selection**
- 📡 **Distributed Agent Communication**
- ⚡ **Parallel and Asynchronous Task Execution**
- 🔍 **Agent Capability Discovery**
- 📊 **Multi-Agent System Evaluation**
- 🤖 **Integration with Modern LLMs and Agent Frameworks**

The long-term goal is to investigate how heterogeneous AI agents can communicate and cooperate more effectively when solving complex tasks.

---

## 📚 References

- **Internet of Agents:** https://arxiv.org/abs/2407.07061
- **Original IoA Repository:** https://github.com/OpenBMB/IoA
- **IoA Documentation:** https://openbmb.github.io/IoA/

---

## 🤔 Want to Run IoA Across Different Devices?

Check out the [distributed setup guide](https://openbmb.github.io/IoA/distributed_service/config.html).

IoA is designed to support heterogeneous agents running in different environments, making distributed multi-agent collaboration possible.

We're continuously improving our research version, and feedback is welcome!

---

## 🌟 Join the IoA Adventure!

We're just getting started with IoA, and we'd love your help to make it even better!

Got ideas for cool ways to use IoA, improve agent collaboration, or connect agents across different environments? We're all ears!

- 👾 Chat with us on [Discord](https://discord.gg/E5XPtynFDh)
- ✉️ Drop us a line at ioa.thunlp@gmail.com
- 📖 Read the [Documentation](https://openbmb.github.io/IoA/)
- 📄 Read the [Paper](https://arxiv.org/abs/2407.07061)

Let's explore the future of AI collaboration together! 🚀

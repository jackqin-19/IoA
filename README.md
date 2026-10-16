Internet of Agents
<p align="center">
  <a href="https://openbmb.github.io/IoA/">Documentation</a> |
  <a href="https://arxiv.org/abs/2407.07061">Paper</a>
</p>

🔧 This Repository
This repository is a personal fork of OpenBMB/IoA, used as the foundation for my undergraduate graduation project.
The original IoA framework is preserved while this repository focuses on further exploration and improvement of multi-agent collaboration.
Current Modifications
- Updated the Open Instruction demo to support newer OpenAI-compatible models.
- Updated the default LLM configuration for AutoGPT and Open Interpreter.
- Verified the IoA multi-agent demo with Docker Compose.
- Configured and tested an OpenAI-compatible API endpoint.
- Further improvements will be developed as part of the graduation project.
Note: This repository is under active development. More modifications and experimental results will be added during the project.

🌎 What is Internet of Agents?
Imagine if AI agents could collaborate like humans do on the internet. That's the idea behind Internet of Agents (IoA)!
It's an open-source framework that aims to create a platform where diverse AI agents can team up to tackle complex tasks.
For example, agents like AutoGPT and Open Interpreter can come together, share their unique skills, and work on problems that might be too tricky for a single agent to solve.
🚀 Key Features
- 🌐 Internet-Inspired Architecture: Just like how the internet connects people, IoA can connect different AI agents across different environments.
- 🤝 Autonomous Nested Team Formation: Agents can form teams and sub-teams on their own, adapting to complex tasks.
- 🧩 Heterogeneous Agent Integration: Brings together agents with different skills and backgrounds, kind of like assembling an all-star team.
- ⏳ Asynchronous Task Execution: Agents can multitask, making the whole system more efficient.
- 🗣️ Adaptive Conversation Flow: The conversation flow is autonomously managed to keep agent conversations structured but flexible.
- 🔄 Scalable and Extensible: Easy to add new types of agents or tackle different kinds of tasks.
For more details, please refer to the IoA paper.
<p align="center">
  <img src="https://github.com/OpenBMB/IoA/assets/32613237/126082a8-432b-4039-8acd-49f4798a492c">
  <br>
  <em>A peek at IoA's layered architecture</em>
</p>

<p align="center">
  <img src="https://github.com/OpenBMB/IoA/assets/32613237/6d081cd8-a935-4e34-a24d-62eb65f8c6ec">
  <br>
  <em>How IoA works</em>
</p>

🚀 Quick Start
1. 📋 Prerequisites
Make sure the following software is installed:
- Docker
- Docker Compose
- Git
2. 📥 Clone the Repository
Clone this fork instead of the original OpenBMB repository:
git clone https://github.com/jackqin-19/IoA.git
cd IoA

3. 🏗️ Build Docker Images
Core Components
You can pull the pre-built Docker images:
# Server
docker pull weize/ioa-server:latest

# Client
docker pull weize/ioa-client:latest

# Server Frontend
docker pull weize/ioa-server-frontend:latest

# Rename the images
docker tag weize/ioa-server:latest ioa-server:latest
docker tag weize/ioa-client:latest ioa-client:latest
docker tag weize/ioa-server-frontend:latest ioa-server-frontend:latest

Or build from source
# Server
docker build -f dockerfiles/server.Dockerfile -t ioa-server:latest .

# Client
docker build -f dockerfiles/client.Dockerfile -t ioa-client:latest .

# Server Frontend
docker build -f dockerfiles/server_frontend.Dockerfile -t ioa-server-frontend:latest .

4. 🤖 Agent Images
ReAct Agent
docker pull weize/react-agent:latest
docker tag weize/react-agent:latest react-agent:latest

AutoGPT
docker pull weize/autogpt:latest
docker tag weize/autogpt:latest autogpt:latest

Open Interpreter
docker pull weize/open-interpreter:latest
docker tag weize/open-interpreter:latest open-interpreter:latest

5. 🌐 Launch Milvus Service
docker network create agent_network
docker compose -f dockerfiles/compose/milvus.yaml up -d

Check the containers:
docker ps

6. ⚙️ Configure Environment Variables
Create the environment file:
cd dockerfiles/compose
copy .env_template .env

Then edit:
dockerfiles/compose/.env

Configure your API information:
OPENAI_API_KEY=your_api_key

OPENAI_BASE_URL=https://api.uiuihao.com/v1
OPENAI_API_BASE_URL=https://api.uiuihao.com/v1
OPENAI_API_BASE=https://api.uiuihao.com/v1

FAST_LLM=gpt-5.4
SMART_LLM=gpt-5.4

OPENAI_RESPONSE_LOG_PATH=/app/openai_response_log

Security Warning
Never commit your real API key to GitHub.
Keep the real API key only in dockerfiles/compose/.env.
The .env file is ignored by Git.

7. 🎬 Start IoA
From the repository root:
cd ../..

Start the Open Instruction demo:
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml up -d

Check the status:
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml ps -a

You should see services similar to:
autogpt-client
ioa-server
open-interpreter-client
server_frontend
milvus-standalone
milvus-etcd
milvus-minio
attu

8. 🌐 Access the Web Interface
After starting the services, open:
Frontend
http://127.0.0.1
Other service endpoints:
- IoA Server: http://127.0.0.1:7788
- AutoGPT: http://127.0.0.1:5050
- Open Interpreter: http://127.0.0.1:5051
- Milvus Attu: http://127.0.0.1:8000
9. 🧪 Test the Multi-Agent System
You can send a goal directly to the AutoGPT client.
curl -X POST http://127.0.0.1:5050/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"Calculate 12345 times 6789 and give the final result.\",\"max_turns\":2,\"team_member_names\":[\"AutoGPT\",\"Open Interpreter\"]}"

Example response:
["f5516b5aea3f47c69ae80e9bd198083f","12345 × 6789 = **83,810,205**."]

You can also test a more complex multi-agent task:
curl -X POST http://127.0.0.1:5050/launch_goal -H "Content-Type: application/json" -d "{\"goal\":\"Analyze the differences between AI Agents and Multi-Agent Systems, and give one practical application example for each.\",\"max_turns\":3,\"team_member_names\":[\"AutoGPT\",\"Open Interpreter\"]}"

10. 🐳 Useful Docker Commands
View running containers
docker ps

View all containers
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml ps -a

View AutoGPT logs
docker logs -f autogpt-client

View Open Interpreter logs
docker logs -f open-interpreter-client

View IoA server logs
docker logs -f ioa-server

Stop the IoA demo
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml down

Start it again
docker compose --env-file dockerfiles/compose/.env -f dockerfiles/compose/open_instruction.yaml up -d

11. 🧪 Test the Open Instruction Dataset
You can use the following script to test IoA on the Open Instruction dataset:
python scripts/open_instruction/test_open_instruction.py

Or send a POST request using Python:
import requestsgoal = """I want to know the annual revenue of Microsoft from 2014 to 2020.Please generate a figure in text format showing the trend of the annual revenue,and give me an analysis report."""response = requests.post(    "http://127.0.0.1:5050/launch_goal",    json={        "goal": goal,        "max_turns": 20,        "team_member_names": [            "AutoGPT",            "Open Interpreter"        ],    },)print(response)


🔬 Graduation Project
This repository serves as the experimental platform for my undergraduate graduation project.
The current work is based on the original Internet of Agents framework and focuses on exploring improvements to multi-agent collaboration.
Potential research directions include:
- Multi-agent task decomposition
- Agent communication
- Task assignment strategies
- Multi-agent collaboration efficiency
- Agent coordination mechanisms
- Heterogeneous agent integration
- Evaluation of multi-agent systems
Experimental results and implementation details will be added progressively.
📚 References
- Internet of Agents (IoA)
- OpenBMB
- AutoGPT
- Open Interpreter
- Milvus
🌟 Acknowledgements
This project is based on the open-source Internet of Agents framework developed by OpenBMB.
The original project and its contributors are gratefully acknowledged.
📄 License
Please refer to the original project's license for licensing information.

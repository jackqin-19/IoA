import yaml
import os
from .log import logger


def _validate_custom_keys(custom, default, path=""):
    if not isinstance(custom, dict):
        raise ValueError(f"Configuration section {path or '<root>'} must be a mapping")
    for key, value in custom.items():
        field = f"{path}.{key}" if path else key
        if key not in default and field != "tool_agent.max_num_steps":
            raise ValueError(f"Unknown configuration field: {field}")
        if isinstance(value, dict):
            expected = default.get(key, {})
            if not isinstance(expected, dict):
                raise ValueError(f"Configuration section {field} must not be a mapping")
            _validate_custom_keys(value, expected, field)
        elif isinstance(default.get(key), dict) and value is not None:
            raise ValueError(f"Configuration section {field} must be a mapping")


def _validate_required_config(config):
    for section, fields in {
        "server": ("hostname", "port"),
        "comm": ("name", "desc", "type"),
        "comm.llm": ("llm_type", "model"),
    }.items():
        value = config
        for part in section.split("."):
            value = value.get(part) if isinstance(value, dict) else None
        if not isinstance(value, dict):
            raise ValueError(f"Configuration section {section} must be a mapping")
        for field in fields:
            if value.get(field) is None or value.get(field) == "":
                raise ValueError(f"Missing required configuration field: {section}.{field}")


def _update_config(default, user):
    for key, value in user.items():
        if isinstance(value, dict):
            default[key] = _update_config(default.get(key, {}), value)
        else:
            default[key] = value
    return default


def update_custom_config(config):
    if custom_config_path := os.getenv("CUSTOM_CONFIG", ""):
        logger.info("Loading custom config from %s" % custom_config_path)
        custom_config: dict = yaml.safe_load(open(custom_config_path))
        if config:
            _validate_custom_keys(custom_config, config)
        _update_config(config, custom_config)
    if config:
        _validate_required_config(config)


def resolve_model_config(config):
    llm_config = config.get("comm", {}).get("llm", {})
    if llm_config.get("model") == "${SMART_LLM}":
        model = os.getenv("SMART_LLM", "").strip()
        if not model:
            raise ValueError("SMART_LLM must be set for this agent's comm.llm.model")
        llm_config["model"] = model


try:
    global_config = yaml.safe_load(open(os.path.join("configs", "default_config.yaml")))
except FileNotFoundError:
    logger.warn(
        "No default config file found, using empty config as the default config. If you want to use a default config file, please make sure it is in the 'configs' folder and named 'default_config.yaml'"
    )
    global_config = {}
update_custom_config(global_config)
resolve_model_config(global_config)

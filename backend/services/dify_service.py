import os
import time
import requests
from typing import Dict, Any, Optional

class DifyError(Exception):
    def __init__(self, code: str, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status

class DifyService:
    @staticmethod
    def get_api_url() -> str:
        url = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1")
        return url.strip().rstrip("/")

    @staticmethod
    def get_api_key() -> str:
        return os.getenv("DIFY_API_KEY", "").strip()

    @classmethod
    def is_configured(cls) -> bool:
        return len(cls.get_api_key()) > 0

    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        api_url = cls.get_api_url()
        api_key = cls.get_api_key()

        if not api_key:
            return {
                "connected": False,
                "configured": False,
                "provider": "dify",
                "apiUrl": api_url,
                "error": {
                    "code": "DIFY_CONFIG_ERROR",
                    "message": "Dify configuration is missing. Set DIFY_API_KEY in .env."
                }
            }

        try:
            res = requests.get(
                f"{api_url}/parameters",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=10
            )
            if res.status_code in [401, 403]:
                return {
                    "connected": False,
                    "configured": True,
                    "provider": "dify",
                    "apiUrl": api_url,
                    "error": {
                        "code": "DIFY_AUTH_ERROR",
                        "message": "Dify rejected the API key. Check the API key in the backend environment."
                    }
                }
            return {
                "connected": res.ok,
                "configured": True,
                "provider": "dify",
                "apiUrl": api_url
            }
        except requests.exceptions.Timeout:
            return {
                "connected": False,
                "configured": True,
                "provider": "dify",
                "apiUrl": api_url,
                "error": {
                    "code": "DIFY_TIMEOUT",
                    "message": "Dify health check timed out."
                }
            }
        except Exception as e:
            return {
                "connected": False,
                "configured": True,
                "provider": "dify",
                "apiUrl": api_url,
                "error": {
                    "code": "DIFY_CONNECTION_ERROR",
                    "message": f"AgentHeal could not connect to Dify at {api_url}."
                }
            }

    @classmethod
    def send_chat_message(cls, query: str, user: str = "agentheal-user", conversation_id: str = "") -> Dict[str, Any]:
        api_url = cls.get_api_url()
        api_key = cls.get_api_key()

        if not api_key:
            raise DifyError("DIFY_CONFIG_ERROR", "Dify configuration is missing. Check DIFY_API_URL and DIFY_API_KEY.")

        endpoint = f"{api_url}/chat-messages"
        payload = {
            "inputs": {},
            "query": query,
            "response_mode": "blocking",
            "conversation_id": conversation_id,
            "user": user
        }

        try:
            start_time = time.time()
            res = requests.post(
                endpoint,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            latency_ms = int((time.time() - start_time) * 1000)

            if not res.ok:
                if res.status_code in [401, 403]:
                    raise DifyError("DIFY_AUTH_ERROR", "Dify rejected the API key.", res.status_code)
                if res.status_code == 404:
                    raise DifyError("DIFY_NOT_FOUND", "The configured Dify endpoint was not found.", res.status_code)
                if res.status_code == 429:
                    raise DifyError("DIFY_RATE_LIMIT", "Dify rate limit reached.", res.status_code)
                raise DifyError("DIFY_BAD_RESPONSE", f"Dify returned {res.status_code}: {res.text}", res.status_code)

            data = res.json()
            return {
                "answer": data.get("answer", ""),
                "conversationId": data.get("conversation_id"),
                "messageId": data.get("message_id"),
                "latencyMs": latency_ms
            }
        except requests.exceptions.Timeout:
            raise DifyError("DIFY_TIMEOUT", "Dify took too long to respond.")
        except DifyError:
            raise
        except Exception as e:
            raise DifyError("DIFY_CONNECTION_ERROR", f"AgentHeal could not connect to Dify: {str(e)}")

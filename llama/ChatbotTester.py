
import requests
import json
import time
from typing import Dict, List


class ChatbotTester:
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url

    def test_query(self, question: str) -> Dict:
        """Test a single query and return response details"""
        try:
            start_time = time.time()

            response = requests.post(
                f"{self.base_url}/api/rag_query",
                json={"question": question},
                timeout=30
            )

            end_time = time.time()
            response_time = end_time - start_time

            if response.status_code == 200:
                response_text = response.text
                return {
                    "success": True,
                    "response": response_text,
                    "response_time": response_time,
                    "response_length": len(response_text),
                    "word_count": len(response_text.split())
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "response_time": response_time
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None
            }

    def debug_query(self, question: str) -> Dict:
        """Get debug information for a query"""
        try:
            response = requests.post(
                f"{self.base_url}/api/debug_query",
                json={"question": question},
                timeout=30
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"HTTP {response.status_code}: {response.text}"}

        except Exception as e:
            return {"error": str(e)}

    def check_health(self) -> Dict:
        """Check system health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"HTTP {response.status_code}: {response.text}"}
        except Exception as e:
            return {"error": str(e)}


def run_comprehensive_tests():
    """Run comprehensive tests on the improved chatbot"""
    tester = ChatbotTester()

    print("=" * 60)
    print("RAG CHATBOT IMPROVEMENT VALIDATION TESTS")
    print("=" * 60)

    # Check system health first
    print("\n1. SYSTEM HEALTH CHECK")
    print("-" * 30)
    health = tester.check_health()
    if "error" in health:
        print(f"❌ Health check failed: {health['error']}")
        print("Please ensure the improved chatbot server is running on port 5001")
        return
    else:
        print("✅ System is healthy")
        print(f"   - Documents loaded: {health.get('documents_loaded', 'Unknown')}")
        print(f"   - Version: {health.get('version', 'Unknown')}")

    # Test queries that commonly cause issues
    test_queries = [
        {
            "question": "My computer is running slow",
            "expected_keywords": ["performance", "slow", "speed", "memory", "disk"],
            "description": "Common performance issue"
        },
        {
            "question": "WiFi not working",
            "expected_keywords": ["network", "wireless", "connection", "wifi"],
            "description": "Network connectivity issue"
        },
        {
            "question": "Computer won't start",
            "expected_keywords": ["boot", "startup", "power", "start"],
            "description": "Boot/startup problem"
        },
        {
            "question": "Blue screen error",
            "expected_keywords": ["error", "crash", "blue", "screen", "system"],
            "description": "System crash issue"
        },
        {
            "question": "How to fix a broken keyboard",
            "expected_keywords": ["keyboard", "input", "device", "replace"],
            "description": "Hardware replacement"
        },
        {
            "question": "What is the meaning of life?",
            "expected_keywords": ["don't have", "information", "specific"],
            "description": "Irrelevant question (should be handled gracefully)"
        }
    ]

    print("\n2. QUERY RESPONSE TESTS")
    print("-" * 30)

    results = []
    for i, test in enumerate(test_queries, 1):
        print(f"\nTest {i}: {test['description']}")
        print(f"Question: '{test['question']}'")

        # Test the query
        result = tester.test_query(test['question'])
        results.append({"test": test, "result": result})

        if result["success"]:
            response = result["response"]
            word_count = result["word_count"]
            response_time = result["response_time"]

            print(f"✅ Response received ({word_count} words, {response_time:.2f}s)")
            print(f"   Response: {response[:100]}{'...' if len(response) > 100 else ''}")

            # Check for expected keywords
            response_lower = response.lower()
            found_keywords = [kw for kw in test["expected_keywords"] if kw in response_lower]

            if found_keywords:
                print(f"✅ Relevant keywords found: {found_keywords}")
            else:
                print(f"⚠️  No expected keywords found. Expected: {test['expected_keywords']}")

            # Check response quality
            if word_count > 200:
                print(f"⚠️  Response might be too long ({word_count} words)")
            elif word_count < 5:
                print(f"⚠️  Response might be too short ({word_count} words)")
            else:
                print(f"✅ Good response length ({word_count} words)")

        else:
            print(f"❌ Query failed: {result['error']}")

    print("\n3. RETRIEVAL ANALYSIS")
    print("-" * 30)

    # Test document retrieval for a few queries
    for test in test_queries[:3]:  # Test first 3 queries
        print(f"\nAnalyzing retrieval for: '{test['question']}'")
        debug_info = tester.debug_query(test['question'])

        if "error" not in debug_info:
            print(f"✅ Retrieved {debug_info['retrieved_docs_count']} documents")
            print(f"   Processed query: '{debug_info['processed_question']}'")

            # Show first retrieved document snippet
            if debug_info['retrieved_docs']:
                first_doc = debug_info['retrieved_docs'][0]
                print(f"   Top document: {first_doc['content'][:80]}...")
        else:
            print(f"❌ Debug query failed: {debug_info['error']}")

    print("\n4. PERFORMANCE SUMMARY")
    print("-" * 30)

    successful_tests = [r for r in results if r["result"]["success"]]
    if successful_tests:
        avg_response_time = sum(r["result"]["response_time"] for r in successful_tests) / len(successful_tests)
        avg_word_count = sum(r["result"]["word_count"] for r in successful_tests) / len(successful_tests)

        print(
            f"✅ Success rate: {len(successful_tests)}/{len(results)} ({len(successful_tests) / len(results) * 100:.1f}%)")
        print(f"✅ Average response time: {avg_response_time:.2f} seconds")
        print(f"✅ Average response length: {avg_word_count:.1f} words")

        # Quality assessment
        long_responses = sum(1 for r in successful_tests if r["result"]["word_count"] > 200)
        short_responses = sum(1 for r in successful_tests if r["result"]["word_count"] < 5)

        print(f"📊 Response length distribution:")
        print(f"   - Too long (>200 words): {long_responses}")
        print(f"   - Too short (<5 words): {short_responses}")
        print(f"   - Appropriate length: {len(successful_tests) - long_responses - short_responses}")
    else:
        print("❌ No successful tests to analyze")

    print("\n5. IMPROVEMENT VALIDATION")
    print("-" * 30)

    improvements_validated = []

    # Check if responses are more concise
    if successful_tests:
        max_words = max(r["result"]["word_count"] for r in successful_tests)
        if max_words <= 200:
            improvements_validated.append("✅ Response length control (max: {max_words} words)")
        else:
            improvements_validated.append(f"⚠️  Some responses still too long (max: {max_words} words)")

    # Check if system handles irrelevant queries gracefully
    irrelevant_test = next((r for r in results if "meaning of life" in r["test"]["question"]), None)
    if irrelevant_test and irrelevant_test["result"]["success"]:
        response = irrelevant_test["result"]["response"].lower()
        if any(phrase in response for phrase in ["don't have", "information", "specific"]):
            improvements_validated.append("✅ Graceful handling of irrelevant queries")
        else:
            improvements_validated.append("⚠️  May still provide irrelevant information")

    # Check response times
    if successful_tests:
        max_time = max(r["result"]["response_time"] for r in successful_tests)
        if max_time <= 10:
            improvements_validated.append(f"✅ Good response times (max: {max_time:.2f}s)")
        else:
            improvements_validated.append(f"⚠️  Some slow responses (max: {max_time:.2f}s)")

    for validation in improvements_validated:
        print(validation)

    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    run_comprehensive_tests()


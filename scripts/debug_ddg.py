import requests
import urllib.parse
from bs4 import BeautifulSoup

def ddg_debug(query):
    base_url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/"
    }
    search_url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    print(f"Searching URL: {search_url}")
    
    response = requests.get(search_url, headers=headers, timeout=15)
    print(f"Status Code: {response.status_code}")
    
    soup = BeautifulSoup(response.text, "html.parser")
    results = soup.select('.result__body')
    print(f"Found {len(results)} results with .result__body")
    
    if len(results) == 0:
        results = soup.select('.result')
        print(f"Found {len(results)} results with .result")
        
    if len(results) == 0:
        print("Page Title:", soup.title.string if soup.title else "No Title")
        print("Response Text Snippet (first 2000 chars):")
        print(response.text[:2000])

if __name__ == "__main__":
    ddg_debug("family court")

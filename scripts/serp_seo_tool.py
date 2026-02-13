import requests
from bs4 import BeautifulSoup
from collections import Counter
import re
import time
import json
import sys
import urllib.parse

import random

def get_random_user_agent():
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
    ]
    return random.choice(user_agents)

def ddg_search(query):
    """
    Scrapes DuckDuckGo search results for a given query.
    This is more stable and less likely to be blocked than Google.
    Using the HTML version of DDG.
    """
    base_url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": get_random_user_agent(),
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://duckduckgo.com/"
    }
    
    payload = urllib.parse.urlencode({'q': query, 'kl': 'us-en'})
    
    try:
        response = requests.post(base_url, data=payload, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching DuckDuckGo results: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    search_results = []
    
    # DDG HTML version results are in result_primary divs
    for result in soup.select('.result__body'):
        title_tag = result.select_one('.result__title a')
        snippet_tag = result.select_one('.result__snippet')
        
        if title_tag:
            title = title_tag.text.strip()
            link = title_tag['href']
            # DDG URLs are sometimes redirected, but this usually works
            if link.startswith('//'):
                link = 'https:' + link
            elif link.startswith('/l/'):
                # Extract actual URL from redirect if needed
                match = re.search(r'uddg=([^&]+)', link)
                if match:
                    link = urllib.parse.unquote(match.group(1))
            
            snippet = snippet_tag.text.strip() if snippet_tag else ""
            
            search_results.append({
                'title': title,
                'link': link,
                'snippet': snippet
            })
            
    return search_results[:10]

def fetch_external_meta(url):
    """
    Fetches Meta Title and Meta Description from a specific URL.
    """
    headers = {
        "User-Agent": get_random_user_agent()
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Title
        title = soup.title.string if soup.title else ""
        
        # Description
        meta_desc = ""
        desc_tag = soup.find('meta', attrs={'name': 'description'}) or \
                   soup.find('meta', attrs={'property': 'og:description'})
        if desc_tag:
            meta_desc = desc_tag.get('content', '')
            
        return title.strip(), meta_desc.strip()
    except Exception:
        return "", ""

def analyze_keywords(results):
    """
    Extracts common keywords from titles, snippets, and fetched metadata.
    """
    all_text = ""
    for res in results:
        all_text += f" {res['title']} {res['snippet']} {res.get('meta_title', '')} {res.get('meta_desc', '')}"
    
    words = re.findall(r'\w+', all_text.lower())
    # Stopper words (basic list)
    stop_words = {'the', 'and', 'for', 'starbucks', 'partner', 'hours', 'with', 'your', 'this', 'that', 'from', 'login', 'portal', 'schedule', 'guide', 'portal', 'management', 'work'}
    
    filtered_words = [w for w in words if len(w) > 3 and w not in stop_words]
    common_words = Counter(filtered_words).most_common(20)
    
    return common_words

def generate_optimization_suggestions(query, common_words):
    """
    Generates suggestions for Meta Title and Description based on keywords.
    """
    top_keywords = [word for word, count in common_words[:5]]
    
    suggested_title = f"{query.title()} - Guide, Login & Support"
    if len(top_keywords) >= 2:
        suggested_title = f"{query.title()}: {top_keywords[0].capitalize()} & {top_keywords[1].capitalize()} Info"
        
    suggested_desc = f"Looking for {query}? Our comprehensive guide covers {', '.join(top_keywords[:3])}, and more to help you manage your Starbucks experience."
    
    return {
        'suggested_title': suggested_title,
        'suggested_meta_description': suggested_desc,
        'relevant_keywords': [word for word, count in common_words]
    }

def main():
    if len(sys.argv) > 1:
        # Check for output file argument
        if "--output" in sys.argv:
            out_idx = sys.argv.index("--output")
            output_file = sys.argv[out_idx + 1]
            # Remove --output and filename from args to get query
            args = sys.argv[1:]
            # Adjust index because args is shifted by 1 from sys.argv
            del args[out_idx-1:out_idx+1]
            query = " ".join(args)
        else:
            output_file = None
            query = " ".join(sys.argv[1:])
    else:
        query = input("Enter the search query/topic: ")
        output_file = None
    
    print(f"\nSearching via DuckDuckGo (HTML) for: '{query}'...")
    results = ddg_search(query)
    
    if not results:
        print("No results found or blocked.")
        return

    print(f"Found {len(results)} results. Fetching deep metadata...")
    
    for i, res in enumerate(results):
        print(f"[{i+1}/{len(results)}] Analyzing {res['link'][:60]}...")
        m_title, m_desc = fetch_external_meta(res['link'])
        res['meta_title'] = m_title
        res['meta_desc'] = m_desc
        time.sleep(1) # Polite delay
        
    keywords = analyze_keywords(results)
    suggestions = generate_optimization_suggestions(query, keywords)
    
    output_text = []
    output_text.append("\n" + "="*80)
    output_text.append(f"SERP INSIGHTS FOR: {query}")
    output_text.append("="*80)
    
    output_text.append("\n--- Top Keywords Found in SERP ---")
    for word, count in keywords[:10]:
        output_text.append(f" - {word}: {count}")
        
    output_text.append("\n--- Optimization Suggestions ---")
    output_text.append(f"Suggested Title: {suggestions['suggested_title']}")
    output_text.append(f"Suggested Meta Description: {suggestions['suggested_meta_description']}")
    
    output_text.append("\n--- Competitor Metadata Analysis ---")
    for idx, res in enumerate(results, 1):
        output_text.append(f"\n{idx}. {res['title']}")
        output_text.append(f"   URL: {res['link']}")
        output_text.append(f"   Snippet: {res['snippet'][:100]}...")
        if res['meta_desc']:
            output_text.append(f"   Real Meta Desc: {res['meta_desc'][:120]}...")

    final_output = "\n".join(output_text)
    print(final_output)

    if output_file:
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(final_output)
            print(f"\nResults saved to {output_file}")
        except Exception as e:
            print(f"Error saving to file: {e}")

if __name__ == "__main__":
    main()

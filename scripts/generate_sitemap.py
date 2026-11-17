#!/usr/bin/env python3
"""
Generate a comprehensive sitemap.xml with all pages, courts, and blog posts.
"""

import os
import json
from datetime import datetime

def generate_sitemap():
    # Base URL
    base_url = "https://thecourtdirect.com"
    
    # Static pages with priorities
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/about", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/blog", "priority": "0.9", "changefreq": "daily"},
        {"loc": "/find-court", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/contact", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/legal-terms", "priority": "0.6", "changefreq": "monthly"},
        {"loc": "/privacy-policy", "priority": "0.5", "changefreq": "yearly"},
        {"loc": "/terms-of-service", "priority": "0.5", "changefreq": "yearly"},
        {"loc": "/write-for-us-law", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/sitemap", "priority": "0.3", "changefreq": "monthly"},
    ]
    
    # Start XML
    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add static pages
    for page in static_pages:
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{base_url}{page["loc"]}</loc>')
        xml_lines.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        xml_lines.append(f'    <priority>{page["priority"]}</priority>')
        xml_lines.append('  </url>')
    
    # Paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Add court pages
    courts_file = os.path.join(project_root, "public", "data", "courts.json")
    if os.path.exists(courts_file):
        with open(courts_file, 'r', encoding='utf-8') as f:
            courts = json.load(f)
        
        print(f"Adding {len(courts)} court pages...")
        for court in courts:
            xml_lines.append('  <url>')
            xml_lines.append(f'    <loc>{base_url}/court/{court["id"]}</loc>')
            xml_lines.append('    <changefreq>monthly</changefreq>')
            xml_lines.append('    <priority>0.7</priority>')
            xml_lines.append('  </url>')
    
    # Only index blog posts that have full content files (avoid thin/404 URLs)
    posts_dir = os.path.join(project_root, "public", "data", "posts")
    published_slugs = set()
    if os.path.exists(posts_dir):
        post_files = [f for f in os.listdir(posts_dir) if f.endswith(".json")]
        print(f"Adding {len(post_files)} published blog post pages from posts directory...")
        for post_file in post_files:
            slug = post_file.replace(".json", "")
            published_slugs.add(slug)
            xml_lines.append("  <url>")
            xml_lines.append(f"    <loc>{base_url}/{slug}</loc>")
            xml_lines.append("    <changefreq>monthly</changefreq>")
            xml_lines.append('    <priority>0.6</priority>')
            xml_lines.append("  </url>")

    # Warn if blog-posts.json lists posts without content files
    blog_posts_file = os.path.join(project_root, "public", "data", "blog-posts.json")
    if os.path.exists(blog_posts_file):
        try:
            with open(blog_posts_file, "r", encoding="utf-8") as f:
                posts = json.load(f)
            orphaned = [p.get("id") for p in posts if p.get("id") and p.get("id") not in published_slugs]
            if orphaned:
                print(f"Warning: {len(orphaned)} blog-posts.json entries lack content files and were omitted from sitemap.")
        except Exception as e:
            print(f"Error reading blog-posts.json: {e}")    
    # Close XML
    xml_lines.append('</urlset>')
    
    # Write sitemap
    output_file = os.path.join(project_root, "public", "sitemap.xml")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_lines))
    
    print(f"\n✓ Sitemap generated successfully!")
    print(f"  Total URLs: {len(xml_lines) - 2}")  # Subtract opening and closing tags
    print(f"  Output: {output_file}")

if __name__ == "__main__":
    generate_sitemap()

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
    
    # Add blog posts from blog-posts.json
    blog_posts_file = os.path.join(project_root, "public", "data", "blog-posts.json")
    if os.path.exists(blog_posts_file):
        try:
            with open(blog_posts_file, 'r', encoding='utf-8') as f:
                posts = json.load(f)
            
            print(f"Adding {len(posts)} blog post pages from blog-posts.json...")
            for post in posts:
                slug = post.get("id")
                if slug:
                    xml_lines.append('  <url>')
                    xml_lines.append(f'    <loc>{base_url}/{slug}</loc>')
                    xml_lines.append('    <changefreq>monthly</changefreq>')
                    xml_lines.append('    <priority>0.6</priority>')
                    xml_lines.append('  </url>')
        except Exception as e:
            print(f"Error reading blog-posts.json: {e}")
    
    # Also add individual posts from posts directory if they exist (for robustness)
    posts_dir = os.path.join(project_root, "public", "data", "posts")
    if os.path.exists(posts_dir):
        post_files = [f for f in os.listdir(posts_dir) if f.endswith('.json')]
        # Filter out slugs already added
        existing_slugs = {post.get("id") for post in posts if post.get("id")} if 'posts' in locals() else set()
        
        added_from_dir = 0
        for post_file in post_files:
            slug = post_file.replace('.json', '')
            if slug not in existing_slugs:
                xml_lines.append('  <url>')
                xml_lines.append(f'    <loc>{base_url}/{slug}</loc>')
                xml_lines.append('    <changefreq>monthly</changefreq>')
                xml_lines.append('    <priority>0.6</priority>')
                xml_lines.append('  </url>')
                added_from_dir += 1
        
        if added_from_dir > 0:
            print(f"Adding {added_from_dir} additional blog post pages from posts directory...")
    
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

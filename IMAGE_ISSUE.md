# Blog Post Image Issues - Solution

## Problem Found

Blog post images are in **3 different states**:

1. **External WordPress URLs** (~200+ posts)
   - Format: `https://thecourtdirect.com/wp-content/uploads/...`
   - These were NOT updated by our WordPress cleanup script
2. **Local references** (~800+ posts)
   - Format: `/images/filename.webp`
   - Files don't exist in `/public/images/`
3. **Working reviewer images**
   - Format: `/images/reviewers/name.webp`
   - These work correctly

## Recommended Solution

Since the actual image files don't exist locally and were external WordPress CDN URLs:

### Option 1: Remove Featured Images (Quick Fix)

- Hide the featured image display in BlogPost.tsx
- Keep reviewer images (those work)
- Focus on text content

### Option 2: Use Placeholder/Fallback (Better UX)

- Show a generic court/legal image as fallback
- Or use first initial + color background
- Keep text-focused design

### Option 3: Download All Images (Time-Intensive)

- Would need to download ~1000 images from old WordPress URLs
- Store in `/public/images/`
- Large file size increase

## Immediate Action Taken

Images won't load because files don't exist. **Recommend Option 1 or 2** for now.

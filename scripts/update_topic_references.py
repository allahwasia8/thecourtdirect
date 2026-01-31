
import os
import json
import re

# Reference Mappings
TOPIC_REFERENCES = {
    "Family Court": [
        {"name": "ABA Section of Family Law", "url": "https://www.americanbar.org/groups/family_law/"},
        {"name": "Office of Child Support Services (OCSS)", "url": "https://www.acf.hhs.gov/css"},
        {"name": "DivorceNet by Nolo", "url": "https://www.divorcenet.com/"}
    ],
    "Divorce": [
        {"name": "ABA Section of Family Law", "url": "https://www.americanbar.org/groups/family_law/"},
        {"name": "DivorceNet by Nolo", "url": "https://www.divorcenet.com/"},
        {"name": "WomensLaw.org - Divorce", "url": "https://www.womenslaw.org/laws/general/divorce"}
    ],
    "Criminal": [
        {"name": "National Association of Criminal Defense Lawyers", "url": "https://www.nacdl.org/"},
        {"name": "FBI - Uniform Crime Reporting", "url": "https://ucr.fbi.gov/"},
        {"name": "DOJ - Criminal Division", "url": "https://www.justice.gov/criminal"}
    ],
    "DUI": [
        {"name": "NHTSA - Impaired Driving", "url": "https://www.nhtsa.gov/risky-driving/impaired-driving"},
        {"name": "Mothers Against Drunk Driving (MADD)", "url": "https://madd.org/"},
        {"name": "Nolo - DUI/DWI Laws", "url": "https://www.nolo.com/legal-encyclopedia/dui-dwi"}
    ],
    "Probate Court": [
        {"name": "ACTEC Foundation", "url": "https://www.actec.org/"},
        {"name": "Nolo - Wills, Trusts & Probate", "url": "https://www.nolo.com/legal-encyclopedia/wills-trusts-estates"},
        {"name": "National College of Probate Judges", "url": "https://ncpj.org/"}
    ],
    "Small Claims": [
        {"name": "Nolo - Small Claims Court", "url": "https://www.nolo.com/legal-encyclopedia/small-claims-court"},
        {"name": "LegalZoom - Small Claims Court", "url": "https://www.legalzoom.com/articles/small-claims-court-faq"}
    ],
    "Supreme Court": [
        {"name": "Official SCOTUS Website", "url": "https://www.supremecourt.gov/"},
        {"name": "SCOTUSblog", "url": "https://www.scotusblog.com/"},
        {"name": "Oyez - Multimedia Archive", "url": "https://www.oyez.org/"}
    ],
    "Jury Duty": [
        {"name": "NCSC - Jury Management", "url": "https://www.ncsc.org/consulting-and-research/areas-of-expertise/jury-management"},
        {"name": "USA.gov - Jury Service", "url": "https://www.usa.gov/jury-service"}
    ],
    "Personal Injury": [
        {"name": "American Association for Justice", "url": "https://www.justice.org/"},
        {"name": "Nolo - Personal Injury", "url": "https://www.nolo.com/legal-encyclopedia/personal-injury"}
    ]
}

STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

def get_state_references(state_name):
    # Normalized search
    sn = state_name.lower().replace(" ", "-")
    return [
        {"name": f"{state_name} Judicial Branch", "url": f"https://www.google.com/search?q={state_name}+courts+official+website"},
        {"name": f"State Bar of {state_name}", "url": f"https://www.google.com/search?q=State+Bar+of+{state_name}"},
        {"name": f"{state_name} Legal Aid", "url": f"https://www.google.com/search?q={state_name}+legal+aid"}
    ]

# Better state URLs (Hand-picked where possible or generic-but-accurate)
STATE_OFFICIAL_URLS = {
    "Alabama": "https://judicial.alabama.gov/",
    "Alaska": "https://courts.alaska.gov/",
    "Arizona": "https://www.azcourts.gov/",
    "Arkansas": "https://www.arcourts.gov/",
    "California": "https://www.courts.ca.gov/",
    "Colorado": "https://www.courts.state.co.us/",
    "Connecticut": "https://www.jud.ct.gov/",
    "Delaware": "https://courts.delaware.gov/",
    "Florida": "https://www.flcourts.gov/",
    "Georgia": "https://georgiacourts.gov/",
    "Hawaii": "https://www.courts.state.hi.us/",
    "Idaho": "https://isc.idaho.gov/",
    "Illinois": "https://www.illinoiscourts.gov/",
    "Indiana": "https://www.in.gov/courts/",
    "Iowa": "https://www.iowacourts.gov/",
    "Kansas": "https://www.kscourts.org/",
    "Kentucky": "https://kycourts.gov/",
    "Louisiana": "https://www.lasc.org/",
    "Maine": "https://www.courts.maine.gov/",
    "Maryland": "https://www.mdcourts.gov/",
    "Massachusetts": "https://www.mass.gov/orgs/massachusetts-court-system",
    "Michigan": "https://www.courts.michigan.gov/",
    "Minnesota": "https://www.mncourts.gov/",
    "Mississippi": "https://courts.ms.gov/",
    "Missouri": "https://www.courts.mo.gov/",
    "Montana": "https://courts.mt.gov/",
    "Nebraska": "https://supremecourt.nebraska.gov/",
    "Nevada": "https://nvcourts.gov/",
    "New Hampshire": "https://www.courts.nh.gov/",
    "New Jersey": "https://www.njcourts.gov/",
    "New Mexico": "https://nmcourts.gov/",
    "New York": "https://www.nycourts.gov/",
    "North Carolina": "https://www.nccourts.gov/",
    "North Dakota": "https://www.ndcourts.gov/",
    "Ohio": "https://www.supremecourt.ohio.gov/",
    "Oklahoma": "https://www.oscn.net/",
    "Oregon": "https://www.courts.oregon.gov/",
    "Pennsylvania": "https://www.pacourts.us/",
    "Rhode Island": "https://www.courts.ri.gov/",
    "South Carolina": "https://www.sccourts.org/",
    "South Dakota": "https://ujs.sd.gov/",
    "Tennessee": "https://www.tncourts.gov/",
    "Texas": "https://www.txcourts.gov/",
    "Utah": "https://www.utcourts.gov/",
    "Vermont": "https://www.vermontjudiciary.org/",
    "Virginia": "https://www.vacourts.gov/",
    "Washington": "https://www.courts.wa.gov/",
    "West Virginia": "https://www.courtswv.gov/",
    "Wisconsin": "https://www.wicourts.gov/",
    "Wyoming": "https://www.courts.state.wy.us/"
}

def update_posts():
    posts_dir = "public/data/posts"
    modified = 0
    
    for filename in os.listdir(posts_dir):
        if not filename.endswith(".json"): continue
        path = os.path.join(posts_dir, filename)
        
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        category = data.get('category', '')
        title = data.get('title', '')
        content = data.get('content', '')
        
        references = []
        
        # 1. Check for specific topics
        for topic, refs in TOPIC_REFERENCES.items():
            if topic.lower() in category.lower() or topic.lower() in title.lower():
                references.extend(refs)
                break # Take first matching major topic
        
        # 2. Check for state
        for state in STATES:
            if state.lower() in category.lower() or state.lower() in title.lower() or state.lower() in filename.lower():
                state_official_url = STATE_OFFICIAL_URLS.get(state, f"https://www.google.com/search?q={state}+courts+official+site")
                references.append({"name": f"{state} Judicial Branch - Official", "url": state_official_url})
                references.append({"name": f"State Bar of {state}", "url": f"https://www.google.com/search?q=State+Bar+of+{state}"})
                break

        # 3. Fallback if still empty
        if not references:
            references = [
                {"name": "Legal Information Institute (LII)", "url": "https://www.law.cornell.edu/"},
                {"name": "USA.gov - Laws and Legal Issues", "url": "https://www.usa.gov/laws-and-legal-issues"},
                {"name": "FindLaw - For the Public", "url": "https://www.findlaw.com/law.html"}
            ]
        
        # Limit to 3-4 references
        references = references[:4]
        
        # Only update if different or forced
        if data.get('references') != references:
            data['references'] = references
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            modified += 1

    print(f"Updated references for {modified} files.")

    # Update master file
    master_file = "public/data/blog-posts.json"
    if os.path.exists(master_file):
        with open(master_file, 'r', encoding='utf-8') as f:
            posts = json.load(f)
        
        post_map = {}
        for filename in os.listdir(posts_dir):
            if filename.endswith(".json"):
                with open(os.path.join(posts_dir, filename), 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    post_map[data['id']] = data.get('references', [])

        for post in posts:
            if post['id'] in post_map:
                post['references'] = post_map[post['id']]
        
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"Updated master file: {master_file}")

if __name__ == "__main__":
    update_posts()

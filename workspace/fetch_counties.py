"""Fetch all US county names from Census Bureau API and output as TypeScript."""
import requests
import json

# Census Bureau FIPS codes API
url = "https://api.census.gov/data/2020/dec/pl?get=NAME&for=county:*&in=state:*"
r = requests.get(url, timeout=30)
data = r.json()

# First row is headers: ['NAME', 'state', 'county']
headers = data[0]
rows = data[1:]

# Build state FIPS -> state name mapping
state_fips = {}
counties_by_state = {}

for row in rows:
    name = row[0]  # "County Name, State Name"
    state_code = row[1]
    
    parts = name.split(", ")
    if len(parts) >= 2:
        county_name = parts[0]
        state_name = parts[-1]
        
        if state_name not in counties_by_state:
            counties_by_state[state_name] = []
        counties_by_state[state_name].append(county_name)

# Sort counties within each state
for state in counties_by_state:
    counties_by_state[state].sort()

# Create state slug mapping
def to_slug(name):
    return name.lower().replace(" ", "-")

# Output as TypeScript
print("// Auto-generated from US Census Bureau 2020 data")
print("// Total counties: " + str(sum(len(v) for v in counties_by_state.values())))
print("")
print("export const countyData: Record<string, string[]> = {")

for state_name in sorted(counties_by_state.keys()):
    slug = to_slug(state_name)
    counties = counties_by_state[state_name]
    counties_json = json.dumps(counties)
    print(f"    '{slug}': {counties_json},")

print("};")

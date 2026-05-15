# Leaflet cluster map of talk locations
#
# Run this from the repository root. This scrapes the location YAML field from
# each talk entry, geolocates it with geopy/Nominatim, and uses getorg to output
# data, HTML, and Javascript for a standalone cluster map.
import frontmatter
import glob
import getorg
import sys
from geopy import Nominatim
from geopy.exc import GeocoderTimedOut

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Set the default timeout, in seconds
TIMEOUT = 5

# Collect the Markdown files
g = glob.glob("_talks/*.md")

# Prepare to geolocate
geocoder = Nominatim(user_agent="nicolashong.github.io")
location_dict = {}
location = ""
permalink = ""
title = ""

# Perform geolocation
for file in g:
    # Read the file
    data = frontmatter.load(file)
    data = data.to_dict()

    # Press on if the location is not present
    if 'location' not in data or not data['location']:
        continue

    # Prepare the description
    title = data.get('title', '').strip()
    venue = data.get('venue', '').strip()
    location = data.get('location', '').strip()
    description = f"{title}<br />{venue}; {location}"

    # Geocode the location and report the status
    try:
        geocoded_location = geocoder.geocode(location, timeout=TIMEOUT)
        if geocoded_location is None:
            print(f"Warning: no geocoding result for {location}")
            continue
        location_dict[description] = geocoded_location
        print(description, geocoded_location)
    except ValueError as ex:
        print(f"Error: geocode failed on input {location} with message {ex}")
    except GeocoderTimedOut as ex:
        print(f"Error: geocode timed out on input {location} with message {ex}")
    except Exception as ex:
        print(f"An unhandled exception occurred while processing input {location} with message {ex}")

# Save the map
m = getorg.orgmap.create_map_obj()
getorg.orgmap.output_html_cluster_map(location_dict, folder_name="talkmap", hashed_usernames=False)

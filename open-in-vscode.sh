#!/bin/bash
url="$1"

base_url="http://localhost:5173/"
base_path="/Users/davidedipumpo/Projects/makh-e-slides/src/"

relative_path="${url#$base_url}"

full_path="$base_path$relative_path"

/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code "$full_path"

#!/bin/bash

# Fix admin page files that are missing closing div tags

FILES=(
  "src/app/admin/contact-info/page.tsx"
  "src/app/admin/contacts/page.tsx"
  "src/app/admin/homepage/page.tsx" 
  "src/app/admin/orders/page.tsx"
  "src/app/admin/posts/page.tsx"
  "src/app/admin/seo/dashboard/page.tsx"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/theme/page.tsx"
)

for FILE in "${FILES[@]}"; do
  echo "Fixing $FILE..."
  
  # Check if file ends with just </div> and needs another </div>
  LAST_LINES=$(tail -10 "$FILE")
  
  if [[ $LAST_LINES == *"    </div>"* ]] && [[ $LAST_LINES == *"  )"* ]] && [[ $LAST_LINES == *"}"* ]]; then
    # Add missing closing div before the final </div>
    sed -i '' '$i\
      </div>' "$FILE"
    echo "Fixed $FILE"
  fi
done

echo "All files fixed!"

import os
import glob

base_dir = "src/app"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Find the lucide-react import line
            if "import {" in content and "} from 'lucide-react';" in content:
                # Basic parsing (assumes single line import or straightforward multi-line)
                lines = content.split('\n')
                new_lines = []
                in_lucide_import = False
                lucide_imports = []
                
                for line in lines:
                    if "from 'lucide-react';" in line and in_lucide_import:
                        # Extract the rest of the line
                        parts = line.split("} from 'lucide-react';")
                        imports_str = parts[0].strip()
                        if imports_str:
                            lucide_imports.extend([x.strip() for x in imports_str.split(',') if x.strip()])
                        
                        # Deduplicate while preserving order
                        seen = set()
                        unique_imports = [x for x in lucide_imports if not (x in seen or seen.add(x))]
                        
                        new_lines.append("import { " + ", ".join(unique_imports) + " } from 'lucide-react';")
                        in_lucide_import = False
                        continue

                    if "from 'lucide-react';" in line and "import" in line:
                         parts = line.split("import {")[1].split("} from 'lucide-react';")[0]
                         imports_str = parts.strip()
                         if imports_str:
                             lucide_imports = [x.strip() for x in imports_str.split(',') if x.strip()]
                         
                         seen = set()
                         unique_imports = [x for x in lucide_imports if not (x in seen or seen.add(x))]
                         new_lines.append("import { " + ", ".join(unique_imports) + " } from 'lucide-react';")
                         continue
                        
                    if "import {" in line and ("lucide" in line or in_lucide_import == False):
                        # check if next lines end with lucide-react (handled by multi-line logic below if we had one, but my generated string is on one line)
                        # The generated template had it all on one line:
                        # import { {icon}, Search, ArrowLeft... } from 'lucide-react';
                        pass

                    new_lines.append(line)

            # Let's just do a simpler string replace specifically for the generated files:
            # We know the generated files have a specific pattern.
            # I will use a regex.
            import re
            
            # Match the single-line lucide-react import
            match = re.search(r"import \{(.*?)\} from 'lucide-react';", content)
            if match:
                imports_str = match.group(1)
                imports_list = [x.strip() for x in imports_str.split(',')]
                # Deduplicate
                seen = set()
                unique_imports = [x for x in imports_list if x and not (x in seen or seen.add(x))]
                
                new_import_line = "import { " + ", ".join(unique_imports) + " } from 'lucide-react';"
                content = content[:match.start()] + new_import_line + content[match.end():]
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed duplicate imports in {file_path}")


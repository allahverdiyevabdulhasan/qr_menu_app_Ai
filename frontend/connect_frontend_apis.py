import os
import re

base_dir = "src/app/(admin)"

# Mapping of page path to API endpoint
api_mappings = {
    "dashboard": "/analytics/analyticsevents/",
    "dashboard/reports/sales": "/orders/orders/",
    "operations/orders": "/orders/orders/",
    "operations/orders/create": "/orders/orders/",
    "operations/kds": "/orders/orders/",
    "operations/waiter": "/tables/tables/",
    "operations/cashier": "/orders/orders/",
    "operations/courier": "/orders/orders/",
    "operations/tables": "/tables/tables/",
    "operations/reservations": "/tables/tables/",
    "management/finance/z-reports": "/payments/payments/",
    "management/finance/refunds": "/payments/payments/",
    "management/expenses": "/expenses/expenses/",
    "management/menu": "/menu/products/",
    "management/menu/ingredients": "/menu/ingredients/",
    "management/inventory": "/inventory/inventoryitems/",
    "management/inventory/forecast": "/inventory/inventoryitems/",
    "management/staff": "/staff/shifts/",
    "management/staff/shifts": "/staff/shifts/",
    "management/staff/payroll": "/staff/shifts/",
    "marketing/campaigns": "/campaigns/campaigns/",
    "marketing/loyalty": "/loyalty/loyaltycards/",
    "marketing/reviews": "/reviews/reviews/",
    "ai/assistant": "/ai_engine/airecommendations/",
    "ai/reports": "/ai_engine/airecommendations/"
}

# Generic fallback endpoint
DEFAULT_ENDPOINT = "/restaurants/list/"

def inject_api_logic(file_path, endpoint):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # If already connected, skip
    if "api.get" in content or "const [data, setData]" in content:
        return False

    # 1. Add imports
    # Replace "import React from 'react';" with "import React, { useState, useEffect } from 'react';"
    if "import React, { useState, useEffect } from 'react';" not in content:
        content = content.replace(
            "import React from 'react';", 
            "import React, { useState, useEffect } from 'react';\nimport { api } from '@/lib/api';\nimport { Loader2 } from 'lucide-react';"
        )

    # 2. Add state and useEffect inside the component
    # Find export default function XYZ() {
    func_pattern = r"(export default function \w+\(\) \{)"
    match = re.search(func_pattern, content)
    if not match:
        return False

    func_def = match.group(1)
    
    state_logic = f"""
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {{
    setIsLoading(true);
    try {{
      const response = await api.get('{endpoint}');
      setData(response.data);
      setError('');
    }} catch (err: any) {{
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    }} finally {{
      setIsLoading(false);
    }}
  }};

  useEffect(() => {{
    fetchData();
  }}, []);
"""
    content = content.replace(func_def, func_def + state_logic)

    # 3. Replace the static text with dynamic state rendering
    static_text_pattern = r'<p className="text-gray-500 max-w-md">.*?Arxa plan \(Django API\) bağlantısı qurulduqdan sonra məlumatlar burada dinamik olaraq əks olunacaq.*?</p>'
    
    dynamic_ui = """
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-gray-500 font-medium">Məlumatlar serverdən (API) çəkilir...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <div className="w-full text-left bg-gray-50 p-6 rounded-xl border border-gray-100 overflow-auto max-h-64 mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Canlı API Məlumatı:</h3>
            <pre className="text-xs text-gray-600 font-mono">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
"""
    
    # We use regex with DOTALL to match the multiline string
    content = re.sub(static_text_pattern, dynamic_ui, content, flags=re.DOTALL)
    
    # Connect the Refresh Button
    content = content.replace(
        '<button className="mt-8 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-gray-900/20">',
        '<button onClick={fetchData} className="mt-8 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-gray-900/20">'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    return True

success_count = 0
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == "page.tsx":
            file_path = os.path.join(root, file)
            # determine relative path
            rel_path = os.path.relpath(root, base_dir).replace('\\', '/')
            if rel_path == '.':
                endpoint = api_mappings.get('dashboard', DEFAULT_ENDPOINT)
            else:
                endpoint = api_mappings.get(rel_path, DEFAULT_ENDPOINT)
                
            if inject_api_logic(file_path, endpoint):
                success_count += 1
                print(f"Connected: {rel_path} -> {endpoint}")

print(f"Successfully integrated {success_count} frontend pages with Backend APIs.")

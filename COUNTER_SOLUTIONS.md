# 统一访问计数器解决方案

## 当前实现
目前使用的是 `api.countapi.xyz` 免费服务，这是一个简单的在线计数器API。

## 更好的解决方案

### 方案1: Firebase Realtime Database (推荐)
```javascript
// 1. 在HTML中添加Firebase SDK
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-database.js"></script>

// 2. 初始化Firebase
const firebaseConfig = {
  // 您的Firebase配置
};

// 3. 修改计数器函数
async function initializeUserCounter() {
  const db = firebase.database();
  const counterRef = db.ref('visitorCount');
  
  // 获取当前计数
  const snapshot = await counterRef.once('value');
  let currentCount = snapshot.val() || 1000;
  
  // 增加计数
  currentCount++;
  
  // 更新数据库
  await counterRef.set(currentCount);
  
  // 更新显示
  userCount = currentCount;
  updateUserCounter();
}
```

### 方案2: Supabase (免费额度)
```javascript
// 1. 在HTML中添加Supabase SDK
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 2. 初始化Supabase
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// 3. 修改计数器函数
async function initializeUserCounter() {
  // 获取当前计数
  const { data, error } = await supabase
    .from('visitor_count')
    .select('count')
    .single();
  
  let currentCount = data?.count || 1000;
  currentCount++;
  
  // 更新计数
  await supabase
    .from('visitor_count')
    .upsert({ id: 1, count: currentCount });
  
  userCount = currentCount;
  updateUserCounter();
}
```

### 方案3: 自建简单API
```python
# server.py (使用Flask)
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# 简单的文件存储
def load_count():
    try:
        with open('counter.json', 'r') as f:
            return json.load(f)['count']
    except:
        return 1000

def save_count(count):
    with open('counter.json', 'w') as f:
        json.dump({'count': count}, f)

@app.route('/api/counter', methods=['GET'])
def get_count():
    count = load_count()
    return jsonify({'count': count})

@app.route('/api/counter/increment', methods=['POST'])
def increment_count():
    count = load_count() + 1
    save_count(count)
    return jsonify({'count': count})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

然后修改JavaScript:
```javascript
async function initializeUserCounter() {
  try {
    // 增加计数
    const response = await fetch('http://your-server:5000/api/counter/increment', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      userCount = data.count;
      updateUserCounter();
    }
  } catch (error) {
    console.log('Server unavailable, using fallback');
    // 使用本地存储作为备用
  }
}
```

### 方案4: Vercel Serverless Functions
```javascript
// api/counter.js (在Vercel项目中)
import fs from 'fs';
import path from 'path';

const counterFile = path.join(process.cwd(), 'data', 'counter.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 读取当前计数
      let count = 1000;
      try {
        const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
        count = data.count;
      } catch (e) {
        // 文件不存在，使用默认值
      }
      
      // 增加计数
      count++;
      
      // 保存计数
      fs.writeFileSync(counterFile, JSON.stringify({ count }));
      
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update counter' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

## 推荐方案
1. **Firebase Realtime Database** - 最简单，有免费额度
2. **Supabase** - 功能强大，免费额度大
3. **自建API** - 完全控制，需要服务器
4. **Vercel Serverless** - 免费，适合静态网站

## 当前临时方案
目前使用的是 `api.countapi.xyz`，这是一个免费的在线计数器服务，可以跨设备同步，但可能不够稳定。

要切换到更好的方案，请选择上述方案之一并替换 `script.js` 中的 `initializeUserCounter` 函数。



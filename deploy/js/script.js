// 数据存储
let currentUser = null;
let users = JSON.parse(localStorage.getItem('bio-punk-users') || '[]');
let messages = JSON.parse(localStorage.getItem('bio-punk-messages') || '[]');
let chamberElements = JSON.parse(localStorage.getItem('bio-punk-chamber') || '[]');
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

const icons = ['🧬', '🦴', '🌸', '👁', '🌿', '⚡', '🌀', '💀', '🦷', '🍃'];

// 初始化示例数据
if (messages.length === 0) {
  messages = [
    { id: Date.now() - 100000, username: '基因猎人X', trait: '第三只眼', content: '收一个能光合作用的基因，用发光骨骼交换！', icon: '🧬', time: Date.now() - 86400000 },
    { id: Date.now() - 50000, username: '嵌合女王', trait: '花瓣肌肤', content: '有人需要玫瑰花瓣基因吗？我这里有新鲜的。', icon: '🌸', time: Date.now() - 43200000 }
  ];
  saveMessages();
}

// 页面切换
function showPage(page) {
  document.querySelectorAll('.page, .page-home').forEach(p => p.classList.remove('active'));
  if (page === 'home') {
    document.getElementById('pageHome').style.display = 'flex';
  } else {
    document.getElementById('pageHome').style.display = 'none';
    document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('active');
  }
  if (page === 'messageboard') renderMessages();
  if (page === 'chamber') renderChamber();
}

// 用户认证
function openAuthModal() {
  document.getElementById('authModal').classList.add('active');
  switchToLogin();
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function switchToLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('modalTitle').textContent = '玩家登入';
}

function switchToRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('modalTitle').textContent = '玩家注册';
}

function handleLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('bio-punk-current-user', JSON.stringify(user));
    updateUserUI();
    closeAuthModal();
    alert('登入成功！欢迎回来，' + username);
  } else {
    alert('用户名或密码错误');
  }
}

function handleRegister() {
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const trait = document.getElementById('regTrait').value;
  if (users.find(u => u.username === username)) {
    alert('用户名已存在');
    return;
  }
  const user = { username, password, trait, joinedAt: Date.now() };
  users.push(user);
  localStorage.setItem('bio-punk-users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('bio-punk-current-user', JSON.stringify(user));
  updateUserUI();
  closeAuthModal();
  alert('注册成功！欢迎，' + username);
}

function updateUserUI() {
  const savedUser = JSON.parse(localStorage.getItem('bio-punk-current-user'));
  if (savedUser) currentUser = savedUser;
  
  const controls = document.getElementById('userControls');
  if (currentUser) {
    controls.innerHTML = `
      <div class="user-panel">
        <span class="user-name">${currentUser.username}</span>
        <span class="user-trait">【${currentUser.trait}】</span>
        <button class="logout-btn" onclick="handleLogout()">登出</button>
      </div>
    `;
    document.getElementById('messageInput').disabled = false;
    document.getElementById('messageInput').placeholder = '写下你想交换的基因...';
    document.querySelector('.submit-btn').disabled = false;
    document.getElementById('loginHint').style.display = 'none';
  } else {
    controls.innerHTML = `<button class="auth-btn" onclick="openAuthModal()">玩家登入/注册</button>`;
    document.getElementById('messageInput').disabled = true;
    document.getElementById('messageInput').placeholder = '请先登入以发布留言';
    document.querySelector('.submit-btn').disabled = true;
    document.getElementById('loginHint').style.display = 'block';
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('bio-punk-current-user');
  updateUserUI();
}

// 留言板
function submitMessage() {
  if (!currentUser) {
    alert('请先登入');
    return;
  }
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content) return;
  const msg = {
    id: Date.now(),
    username: currentUser.username,
    trait: currentUser.trait,
    content,
    icon: icons[Math.floor(Math.random() * icons.length)],
    time: Date.now()
  };
  messages.unshift(msg);
  saveMessages();
  renderMessages();
  input.value = '';
  document.getElementById('charCount').textContent = '0/300';
}

function deleteMessage(id) {
  const msg = messages.find(m => m.id === id);
  if (msg && currentUser && msg.username === currentUser.username) {
    if (confirm('确定要删除这条留言吗？')) {
      messages = messages.filter(m => m.id !== id);
      saveMessages();
      renderMessages();
    }
  } else if (!currentUser) {
    alert('请先登入');
  } else {
    alert('你只能删除自己的留言');
  }
}

function saveMessages() {
  localStorage.setItem('bio-punk-messages', JSON.stringify(messages));
}

function renderMessages() {
  const list = document.getElementById('messagesList');
  list.innerHTML = messages.map((msg, i) => `
    <div class="message-item" style="animation-delay: ${i * 0.1}s">
      <span class="msg-icon">${msg.icon}</span>
      <div class="msg-content">
        <div class="msg-header">
          <span class="msg-author">${msg.username}</span>
          <span class="msg-trait">【${msg.trait}】</span>
          <span class="msg-time">${formatTime(msg.time)}</span>
        </div>
        <p class="msg-text">${msg.content}</p>
      </div>
      <button class="delete-btn" onclick="deleteMessage(${msg.id})">×</button>
    </div>
  `).join('');
}

function formatTime(time) {
  const diff = Date.now() - time;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  return new Date(time).toLocaleDateString('zh-CN');
}

// 培养舱
function addElement(icon, type) {
  const element = {
    id: Date.now() + Math.random(),
    icon,
    type,
    x: 100 + Math.random() * 300,
    y: 100 + Math.random() * 200
  };
  chamberElements.push(element);
  renderChamber();
}

function renderChamber() {
  const area = document.getElementById('chamberArea');
  area.innerHTML = chamberElements.map(el => `
    <div class="chamber-element" 
         style="left: ${el.x}px; top: ${el.y}px; position: absolute; font-size: 48px; cursor: move; user-select: none; filter: drop-shadow(0 0 10px #39ff14);"
         data-id="${el.id}"
         onmousedown="startDrag(event, ${el.id})">
      ${el.icon}
      <button style="position: absolute; top: -5px; right: -5px; background: #ff0040; border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1;" onclick="event.stopPropagation(); removeElement(${el.id})">×</button>
    </div>
  `).join('');
}

function startDrag(e, id) {
  draggedElement = chamberElements.find(el => el.id === id);
  const el = document.querySelector('[data-id="' + id + '"]');
  dragOffset.x = e.clientX - el.offsetLeft;
  dragOffset.y = e.clientY - el.offsetTop;
  
  document.onmousemove = function(e) {
    if (!draggedElement) return;
    const area = document.getElementById('chamberArea');
    const rect = area.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x + area.scrollLeft, rect.width - 60));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y + area.scrollTop, rect.height - 60));
    draggedElement.x = newX;
    draggedElement.y = newY;
    const el = document.querySelector('[data-id="' + draggedElement.id + '"]');
    if (el) {
      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
    }
  };
  
  document.onmouseup = function() {
    saveChamber();
    draggedElement = null;
    document.onmousemove = null;
    document.onmouseup = null;
  };
}

function removeElement(id) {
  chamberElements = chamberElements.filter(el => el.id !== id);
  renderChamber();
  saveChamber();
}

function saveChamber() {
  localStorage.setItem('bio-punk-chamber', JSON.stringify(chamberElements));
  alert('培养舱已保存！');
}

function clearChamber() {
  if (confirm('确定要清空培养舱吗？')) {
    chamberElements = [];
    saveChamber();
    renderChamber();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  updateUserUI();
  renderMessages();
  renderChamber();
  
  // 字数统计
  document.getElementById('messageInput').addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length + '/300';
  });
  
  // 点击模态框外部关闭
  document.getElementById('authModal').addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
  });
});

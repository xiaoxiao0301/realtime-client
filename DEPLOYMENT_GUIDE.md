# 部署到 Cloudflare 的完整指南

这个指南将帮助您将实时聊天应用部署到 Cloudflare 平台上。

## 前置要求

1. **Cloudflare 账号**: 注册一个免费的 Cloudflare 账号
2. **Node.js**: 安装 Node.js (推荐 v18 或更高版本)
3. **Wrangler CLI**: Cloudflare 的命令行工具

## 第一步: 安装 Wrangler CLI

```bash
npm install -g wrangler
```

## 第二步: 登录 Cloudflare

```bash
wrangler login
```

这将打开浏览器，让您登录 Cloudflare 账号并授权 Wrangler。

## 第三步: 部署后端 (Cloudflare Workers)

1. **进入后端目录**:
```bash
cd realtime-server
```

2. **安装依赖**:
```bash
npm install
```

3. **部署到 Cloudflare Workers**:
```bash
wrangler publish
```

部署完成后，您会得到一个 Worker URL，类似于：
`https://realtime-server.your-account.workers.dev`

记录这个 URL，因为前端需要连接到这个地址。

## 第四步: 配置前端环境变量

1. **更新前端环境变量**:
编辑 `realtime-client/.env.production` 文件，将 WebSocket URL 替换为您的 Worker URL：

```env
REACT_APP_WS_URL=wss://realtime-server.your-account.workers.dev/ws
```

注意：使用 `wss://` (安全WebSocket) 而不是 `ws://`

## 第五步: 部署前端 (Cloudflare Pages)

### 方法一: 通过 Git 仓库自动部署 (推荐)

1. **将代码推送到 Git 仓库** (GitHub, GitLab, 或 Bitbucket):
```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push origin main
```

2. **登录 Cloudflare Dashboard**:
   - 访问 https://dash.cloudflare.com
   - 选择 "Pages" 选项卡
   - 点击 "Create a project"

3. **连接 Git 仓库**:
   - 选择您的 Git 提供商
   - 选择包含前端代码的仓库
   - 设置构建配置：
     - **Framework preset**: Create React App
     - **Build command**: `npm run build`
     - **Build output directory**: `build`
     - **Root directory**: `realtime-client`

4. **设置环境变量**:
   在 Pages 设置中添加：
   ```
   REACT_APP_WS_URL = wss://realtime-server.your-account.workers.dev/ws
   ```

5. **部署**:
   点击 "Save and Deploy"

### 方法二: 使用 Wrangler CLI 直接部署

1. **进入前端目录**:
```bash
cd realtime-client
```

2. **安装依赖**:
```bash
npm install
```

3. **构建应用**:
```bash
npm run build
```

4. **使用 Wrangler 部署**:
```bash
wrangler pages publish build --project-name realtime-client
```

## 第六步: 配置自定义域名 (可选)

1. 在 Cloudflare Dashboard 中，进入 Pages 项目设置
2. 点击 "Custom domains" 标签
3. 添加您的自定义域名
4. 按照指示配置 DNS 记录

## 第七步: 测试部署

1. 访问您的 Pages 应用 URL
2. 测试实时聊天功能
3. 测试文件上传/下载功能
4. 在多个浏览器标签页中测试同步功能

## 本地开发环境设置

如果您想在本地测试 Cloudflare Workers：

1. **启动本地 Worker**:
```bash
cd realtime-server
wrangler dev
```

2. **启动 React 开发服务器**:
```bash
cd realtime-client
npm start
```

## 故障排查

### 常见问题

1. **WebSocket 连接失败**:
   - 检查环境变量是否正确设置
   - 确保使用 `wss://` 而不是 `ws://`
   - 检查 Worker 是否正常运行

2. **CORS 错误**:
   - Worker 代码已经包含了 CORS 头部配置
   - 如果仍有问题，检查 `worker.js` 中的 CORS 设置

3. **构建失败**:
   - 确保所有依赖都已安装
   - 检查 Node.js 版本是否兼容

### 查看日志

- **Worker 日志**: 在 Cloudflare Dashboard > Workers & Pages > 您的 Worker > Logs
- **Pages 日志**: 在 Cloudflare Dashboard > Pages > 您的项目 > Functions > Logs

## 性能优化建议

1. **启用缓存**: Cloudflare 会自动缓存静态资源
2. **压缩**: 启用 Gzip/Brotli 压缩
3. **CDN**: 利用 Cloudflare 的全球 CDN 网络
4. **Image 优化**: 使用 Cloudflare Images 服务优化图片

## 成本估算

- **Cloudflare Workers**: 免费套餐每天 100,000 请求
- **Cloudflare Pages**: 免费套餐每月 500 次构建
- **带宽**: 前 100GB 免费

对于大多数小到中型应用，免费套餐就足够了。

## 注意事项

1. **WebSocket 连接限制**: Workers 有连接时间限制，长时间不活跃的连接可能会被断开
2. **内存限制**: Durable Objects 有内存限制，需要定期清理旧数据
3. **地理分布**: 数据会在全球复制，考虑数据一致性

## 后续维护

1. **监控**: 设置 Cloudflare Analytics 监控应用性能
2. **更新**: 定期更新依赖和 Cloudflare 配置
3. **备份**: 考虑实现数据持久化方案

完成这些步骤后，您的实时聊天应用就会运行在 Cloudflare 的全球网络上，享受高性能和高可用性！
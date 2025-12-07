// ============================================
// ARQUIVO 1: server.js
// Backend Node.js para converter YouTube em MP3
// ============================================

const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Rota para obter informações do vídeo
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'URL inválida do YouTube' });
        }

        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;
        
        res.json({
            title: videoDetails.title,
            author: videoDetails.author.name,
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
            duration: videoDetails.lengthSeconds,
            views: videoDetails.viewCount
        });
        
    } catch (error) {
        console.error('Erro ao obter informações:', error);
        res.status(500).json({ error: 'Erro ao obter informações do vídeo' });
    }
});

// Rota para baixar o áudio
app.get('/api/download', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'URL inválida' });
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim();
        
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio',
        }).pipe(res);
        
    } catch (error) {
        console.error('Erro no download:', error);
        res.status(500).json({ error: 'Erro ao baixar o vídeo' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Acesse: http://localhost:${PORT}`);
});


// ============================================
// ARQUIVO 2: package.json
// Dependências do projeto
// ============================================

/*
{
  "name": "youtube-mp3-converter",
  "version": "1.0.0",
  "description": "Conversor de YouTube para MP3",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ytdl-core": "^4.11.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
*/


// ============================================
// ARQUIVO 3: public/index.html
// Frontend - Interface do usuário
// ============================================

/*
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conversor YouTube para MP3</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }

        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
        }

        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }

        input[type="text"] {
            width: 100%;
            padding: 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .video-preview {
            display: none;
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }

        .video-preview.show {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .video-preview img {
            width: 160px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
        }

        .video-info {
            flex: 1;
        }

        .video-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }

        .video-author {
            font-size: 13px;
            color: #666;
        }

        .btn {
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-success {
            background: #4caf50;
            color: white;
        }

        .btn-success:hover:not(:disabled) {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
        }

        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .progress-container {
            display: none;
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 12px;
        }

        .progress-bar {
            width: 100%;
            height: 12px;
            background: #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .status {
            text-align: center;
            color: #333;
            font-weight: 600;
        }

        .error-message {
            display: none;
            padding: 15px;
            background: #fee;
            border-left: 4px solid #f44;
            border-radius: 6px;
            color: #c33;
            margin: 15px 0;
            font-size: 13px;
        }

        .error-message.show {
            display: block;
        }

        .info-box {
            margin-top: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 12px;
            font-size: 13px;
            color: #666;
        }

        .info-box h3 {
            font-size: 15px;
            margin-bottom: 10px;
            color: #333;
        }

        .info-box ul {
            margin-left: 20px;
        }

        .info-box li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Conversor YouTube → MP3</h1>
        <p class="subtitle">Baixe áudio de qualquer vídeo do YouTube</p>

        <div class="input-group">
            <label for="youtube-url">🔗 Cole o link do YouTube:</label>
            <input type="text" id="youtube-url" placeholder="https://www.youtube.com/watch?v=...">
        </div>

        <div id="video-preview" class="video-preview">
            <img id="video-thumbnail" src="" alt="Thumbnail">
            <div class="video-info">
                <div class="video-title" id="video-title"></div>
                <div class="video-author" id="video-author"></div>
            </div>
        </div>

        <button class="btn btn-primary" id="load-btn" onclick="loadVideo()">
            📺 Carregar Vídeo
        </button>

        <button class="btn btn-success" id="download-btn" onclick="downloadMP3()" style="display:none;">
            📥 Baixar MP3
        </button>

        <div class="error-message" id="error-message"></div>

        <div class="progress-container" id="progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
            <div class="status" id="status">Processando...</div>
        </div>

        <div class="info-box">
            <h3>ℹ️ Como usar:</h3>
            <ul>
                <li>Cole o link do YouTube no campo acima</li>
                <li>Clique em "Carregar Vídeo" para ver as informações</li>
                <li>Clique em "Baixar MP3" para converter e baixar</li>
                <li>100% gratuito e ilimitado</li>
            </ul>
        </div>
    </div>

    <script>
        const API_URL = window.location.origin;
        let currentVideoUrl = '';
        let videoInfo = null;

        async function loadVideo() {
            const url = document.getElementById('youtube-url').value.trim();
            
            if (!url) {
                showError('Por favor, cole um link do YouTube.');
                return;
            }

            if (!isValidYouTubeUrl(url)) {
                showError('Link inválido. Use um link válido do YouTube.');
                return;
            }

            hideError();
            showProgress('Carregando informações do vídeo...');
            document.getElementById('load-btn').disabled = true;

            try {
                const response = await fetch(`${API_URL}/api/video-info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar vídeo');
                }

                videoInfo = await response.json();
                currentVideoUrl = url;

                document.getElementById('video-thumbnail').src = videoInfo.thumbnail;
                document.getElementById('video-title').textContent = videoInfo.title;
                document.getElementById('video-author').textContent = `Canal: ${videoInfo.author}`;
                document.getElementById('video-preview').classList.add('show');
                document.getElementById('download-btn').style.display = 'block';

                hideProgress();
                document.getElementById('load-btn').disabled = false;

            } catch (error) {
                console.error('Erro:', error);
                hideProgress();
                showError('Erro ao carregar o vídeo. Tente novamente.');
                document.getElementById('load-btn').disabled = false;
            }
        }

        async function downloadMP3() {
            if (!currentVideoUrl) return;

            showProgress('Preparando download... Isso pode levar alguns minutos.');
            document.getElementById('download-btn').disabled = true;

            try {
                // Criar link de download
                const downloadUrl = `${API_URL}/api/download?url=${encodeURIComponent(currentVideoUrl)}`;
                
                // Criar elemento de link temporário e clicar nele
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${videoInfo.title}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setTimeout(() => {
                    hideProgress();
                    document.getElementById('download-btn').disabled = false;
                    showSuccess('Download iniciado! Verifique seus downloads.');
                }, 2000);

            } catch (error) {
                console.error('Erro:', error);
                hideProgress();
                showError('Erro ao baixar. Tente novamente.');
                document.getElementById('download-btn').disabled = false;
            }
        }

        function isValidYouTubeUrl(url) {
            return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
        }

        function showProgress(message) {
            document.getElementById('progress').style.display = 'block';
            document.getElementById('status').textContent = message;
            document.getElementById('progress-fill').style.width = '100%';
        }

        function hideProgress() {
            document.getElementById('progress').style.display = 'none';
        }

        function showError(message) {
            const errorEl = document.getElementById('error-message');
            errorEl.textContent = '❌ ' + message;
            errorEl.classList.add('show');
        }

        function hideError() {
            document.getElementById('error-message').classList.remove('show');
        }

        function showSuccess(message) {
            const errorEl = document.getElementById('error-message');
            errorEl.textContent = '✅ ' + message;
            errorEl.style.background = '#e8f5e9';
            errorEl.style.borderLeftColor = '#4caf50';
            errorEl.style.color = '#2e7d32';
            errorEl.classList.add('show');
            
            setTimeout(() => {
                errorEl.classList.remove('show');
                errorEl.style.background = '';
                errorEl.style.borderLeftColor = '';
                errorEl.style.color = '';
            }, 3000);
        }
    </script>
</body>
</html>
*/


// ============================================
// INSTRUÇÕES DE INSTALAÇÃO E DEPLOY
// ============================================

/*

📦 ESTRUTURA DE PASTAS:

youtube-mp3-converter/
├── server.js
├── package.json
└── public/
    └── index.html


🚀 PASSO A PASSO PARA RODAR LOCALMENTE:

1. Instale o Node.js:
   - Baixe em: https://nodejs.org
   - Escolha a versão LTS (recomendada)

2. Crie a pasta do projeto e os arquivos acima

3. Abra o terminal na pasta do projeto e rode:
   npm install

4. Inicie o servidor:
   npm start

5. Acesse no navegador:
   http://localhost:3000


☁️ DEPLOY GRATUITO NO RENDER:

1. Crie uma conta em: https://render.com

2. Conecte seu GitHub:
   - Crie um repositório no GitHub
   - Faça upload dos arquivos (server.js, package.json, public/index.html)

3. No Render:
   - Clique em "New +"
   - Selecione "Web Service"
   - Conecte seu repositório do GitHub
   - Configure:
     * Build Command: npm install
     * Start Command: npm start
   - Clique em "Create Web Service"

4. Aguarde o deploy (5-10 minutos)

5. Você receberá um link tipo:
   https://seu-app.onrender.com

6. Pronto! Compartilhe esse link com seu amigo


⚡ ALTERNATIVA: DEPLOY NO RAILWAY

1. Acesse: https://railway.app

2. Clique em "Start a New Project"

3. Selecione "Deploy from GitHub repo"

4. Escolha seu repositório

5. Railway detecta automaticamente Node.js e faz o deploy

6. Link gerado automaticamente!


💡 DICAS:

- O plano gratuito do Render pode "dormir" após 15 minutos sem uso
- O primeiro acesso após "dormir" pode levar 30-60 segundos
- Para manter sempre ativo, use um serviço de "ping" gratuito
- O Railway oferece 500h/mês grátis (suficiente para uso pessoal)


🔧 SOLUÇÃO DE PROBLEMAS:

- Se der erro no download, tente atualizar o ytdl-core:
  npm update ytdl-core

- Se o vídeo não carregar, pode ser restrição de região
  
- Para vídeos longos (>1h), o download pode demorar mais

*/
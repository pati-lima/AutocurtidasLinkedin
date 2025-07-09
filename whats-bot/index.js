const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Carrega contatos e mensagens
const contatos = require('./contatos.json');
const mensagens = require('./mensagens.json');

// Inicializa cliente
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
});

client.on('qr', (qr) => {
  console.log('📲 Escaneie o QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ Bot conectado ao WhatsApp!');

  const chats = await client.getChats();

  for (const contato of contatos) {
    const chat = chats.find((c) => c.name && c.name.includes(contato.nome));

    if (!chat) {
      console.log(`❌ Chat com o nome "${contato.nome}" não encontrado.`);
      continue;
    }

    const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];

    try {
      await chat.sendMessage(mensagem);
      console.log(`✅ Mensagem enviada para ${contato.nome}`);
    } catch (error) {
      console.log(`❌ Erro ao enviar para ${contato.nome}:`, error.message);
    }
  }

 console.log('🎉 Todas as mensagens foram processadas!');
setTimeout(() => {
  client.destroy();
  console.log('👋 Sessão encerrada com segurança.');
}, 5000); // espera 5 segundos antes de fechar
});

client.initialize();

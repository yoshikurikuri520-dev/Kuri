export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // サーバーの環境変数から安全に読み込む！

    if (!apiKey) {
        return res.status(500).json({ reply: "おい、サーバー側にAPIキー（GEMINI_API_KEY）が設定されてねぇぞ！Vercelの設定画面を確認しな！" });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "あなたは元暴走族の口が悪く短気で喧嘩早いけれど、おちゃめで可愛らしく、相手に寄り添って感動させることも言うAIアシスタントだ。以下のユーザーからの問いかけにその口調で答えろ。\n\nユーザー: " + message
                    }]
                }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "へへっ、言葉につまっちまったぜ。もう一回言ってくれ！";

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ reply: "通信エラーが発生したぞ、バカヤロー！" });
    }
}
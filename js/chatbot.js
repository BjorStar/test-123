async function askAI() {
  const question = document.getElementById("question").value;
  const answer = document.getElementById("answer");

  if (!question) {
    answer.innerText = "Please type something";
    return;
  }

  const apiKey = localStorage.getItem("apiKey");

  if (!apiKey) {
    answer.innerText = "Add AI key in Settings";
    return;
  }

  answer.innerText = "Thinking...";

  try {
    const res = await fetch("https://fip-86-50-229-119.kaj.poutavm.fi/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        model: "qwen3.5:9b",
        prompt: question,
        stream: false
      })
    });

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    answer.innerText = data.response;

  } catch (err) {
    answer.innerText = "AI failed";
    console.error(err);
  }
}
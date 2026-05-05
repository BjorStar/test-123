async function getJoke() {
  const el = document.getElementById("joke");

  try {
    el.innerText = "Loading joke...";

    const res = await fetch("https://official-joke-api.appspot.com/random_joke");
    const data = await res.json();

    el.innerHTML = `
      <h5>Dagens skämt</h5>
      <p>${data.setup}</p>
      <strong>${data.punchline}</strong>
    `;
  } catch {
    el.innerHTML = "Could not load joke";
  }
}
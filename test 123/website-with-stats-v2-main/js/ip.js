async function getIP() {
  const el = document.getElementById("ip");

  try {
    el.innerText = "Loading IP...";

    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    el.innerHTML = `
      <h5>Min IP-adress</h5>
      <p>IP: ${data.ip}</p>
      <p>${data.city}, ${data.country_name}</p>
    `;
  } catch (err) {
    el.innerHTML = "Could not load IP";
    console.error(err);
  }
}
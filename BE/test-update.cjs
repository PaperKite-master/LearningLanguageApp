async function test() {
  const loginRes = await fetch("http://127.0.0.1:4000/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@hina.com", password: "Password123!" })
  });
  const authData = await loginRes.json();
  const token = authData.data.accessToken;
  const res = await fetch("http://127.0.0.1:4000/admin/grammars/undefined", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({
      title: "Ngữ pháp 〜に従って・〜に沿って・〜に関する・〜伺う",
    })
  });
  const data = await res.json();
  console.log(res.status, data);
}
test();

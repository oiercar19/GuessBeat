import { useEffect, useState } from "react";
import { Container, Card, Spinner, Image } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import { getRanking } from "../services/api";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const data = await getRanking();
        setRanking(data);
      } catch (err) {
        console.error("Error al cargar ranking:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRanking();
  }, []);

  const getAvatarSrc = (index) => `/avatars/${index || 0}.jpg`;

  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111, #1a1a40, #000)",
        color: "#fff",
        paddingTop: "100px",
      }}
    >
      <AppNavbar />

      <Container className="d-flex flex-column align-items-center">
        <Card
          className="p-4 shadow-lg text-white w-100 text-center"
          style={{
            background: "rgba(25,25,40,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "850px",
            borderRadius: "16px",
          }}
        >
          <h3 className="text-info mb-3 fw-bold">🏆 Ranking de Jugadores</h3>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="info" />
            </div>
          ) : ranking.length === 0 ? (
            <p className="text-muted">Aún no hay jugadores registrados</p>
          ) : (
            <>
              {/* 🥇 Podio principal */}
              <div
                className="d-flex justify-content-center align-items-end gap-5 mb-4"
                style={{ height: "270px" }}
              >
                {/* 🥈 Segundo lugar */}
                {topThree[1] && (
                  <div
                    style={{
                      background: "linear-gradient(180deg, #c0c0c0, #808080)",
                      width: "170px",
                      height: "180px",
                      borderRadius: "12px",
                      boxShadow: "0 0 25px rgba(255,255,255,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      position: "relative",
                      transform: "translateY(10px)",
                    }}
                  >
                    {/* Medalla grande sobre el avatar */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-25px",
                        fontSize: "2.5rem",
                      }}
                    >
                      🥈
                    </div>

                    <Image
                      src={getAvatarSrc(topThree[1].avatarIndex)}
                      roundedCircle
                      width="65"
                      height="65"
                      className="border border-2 border-light shadow-sm mb-2 mt-2"
                    />
                    <div className="fw-semibold mt-1">
                      {topThree[1].username}
                    </div>
                    <small className="text-light opacity-75 mb-2">
                      {topThree[1].stats} pts
                    </small>
                  </div>
                )}

                {/* 🥇 Primer lugar */}
                {topThree[0] && (
                  <div
                    style={{
                      background: "linear-gradient(180deg, #ffd700, #b8860b)",
                      width: "220px",
                      height: "220px",
                      borderRadius: "12px",
                      boxShadow: "0 0 35px rgba(255,215,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      position: "relative",
                      transform: "translateY(-15px)",
                    }}
                  >
                    {/* Medalla grande sobre el avatar */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0px",
                        fontSize: "3rem",
                      }}
                    >
                      🥇
                    </div>

                    <Image
                      src={getAvatarSrc(topThree[0].avatarIndex)}
                      roundedCircle
                      width="75"
                      height="75"
                      className="border border-3 border-light shadow-sm mb-2 mt-3"
                    />
                    <div className="fw-bold mt-1">{topThree[0].username}</div>
                    <small className="text-light opacity-75 mb-2">
                      {topThree[0].stats} pts
                    </small>
                  </div>
                )}

                {/* 🥉 Tercer lugar */}
                {topThree[2] && (
                  <div
                    style={{
                      background: "linear-gradient(180deg, #cd7f32, #8b4513)",
                      width: "170px",
                      height: "180px",
                      borderRadius: "12px",
                      boxShadow: "0 0 25px rgba(205,127,50,0.4)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      position: "relative",
                      transform: "translateY(10px)",
                    }}
                  >
                    {/* Medalla grande sobre el avatar */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-25px",
                        fontSize: "2.5rem",
                      }}
                    >
                      🥉
                    </div>

                    <Image
                      src={getAvatarSrc(topThree[2].avatarIndex)}
                      roundedCircle
                      width="65"
                      height="65"
                      className="border border-2 border-light shadow-sm mb-2 mt-2"
                    />
                    <div className="fw-semibold mt-1">
                      {topThree[2].username}
                    </div>
                    <small className="text-light opacity-75 mb-2">
                      {topThree[2].stats} pts
                    </small>
                  </div>
                )}
              </div>

              {/* 📋 Lista de los demás jugadores */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "1rem",
                }}
              >
                {rest.length > 0 ? (
                  rest.map((user, i) => (
                    <div
                      key={user._id}
                      className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded-3"
                      style={{
                        background: "rgba(40,40,60,0.8)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <span
                          className="fw-bold"
                          style={{
                            color: "#0dcaf0",
                            minWidth: "30px",
                            textAlign: "center",
                          }}
                        >
                          #{i + 4}
                        </span>
                        <Image
                          src={getAvatarSrc(user.avatarIndex)}
                          roundedCircle
                          width="40"
                          height="40"
                          className="border border-2 border-info"
                        />
                        <strong>{user.username}</strong>
                      </div>
                      <span className="text-warning fw-semibold">
                        {user.stats} pts
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay más jugadores</p>
                )}
              </div>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}

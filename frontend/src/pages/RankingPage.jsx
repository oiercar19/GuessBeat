import { useEffect, useState } from "react";
import { Container, Card, Spinner, Image } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import { getRanking } from "../services/api";
import "./RankingPage.css";

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
    <div className="ranking-page">
      <AppNavbar />

      <Container className="ranking-page__container">
        <Card className="ranking-card p-4 shadow-lg text-white w-100 text-center">
          <h3 className="ranking-card__title">🏆 Ranking de Jugadores</h3>

          {loading ? (
            <div className="ranking-card__loading">
              <Spinner animation="border" variant="info" />
            </div>
          ) : ranking.length === 0 ? (
            <p className="ranking-card__empty">Aún no hay jugadores registrados</p>
          ) : (
            <>
              {/* 🥇 Podio principal */}
              <div className="podium">
                {/* 🥈 Segundo lugar */}
                {topThree[1] && (
                  <div className="podium__position podium__position--second">
                    <div className="podium__medal podium__medal--second">🥈</div>
                    <Image
                      src={getAvatarSrc(topThree[1].avatarIndex)}
                      roundedCircle
                      width="65"
                      height="65"
                      className="podium__avatar--second shadow-sm"
                      alt={`Avatar de ${topThree[1].username}`}
                    />
                    <div className="podium__username">{topThree[1].username}</div>
                    <small className="podium__points">{topThree[1].stats} pts</small>
                  </div>
                )}

                {/* 🥇 Primer lugar */}
                {topThree[0] && (
                  <div className="podium__position podium__position--first">
                    <div className="podium__medal podium__medal--first">🥇</div>
                    <Image
                      src={getAvatarSrc(topThree[0].avatarIndex)}
                      roundedCircle
                      width="75"
                      height="75"
                      className="podium__avatar--first shadow-sm"
                      alt={`Avatar de ${topThree[0].username}`}
                    />
                    <div className="podium__username podium__username--first">
                      {topThree[0].username}
                    </div>
                    <small className="podium__points">{topThree[0].stats} pts</small>
                  </div>
                )}

                {/* 🥉 Tercer lugar */}
                {topThree[2] && (
                  <div className="podium__position podium__position--third">
                    <div className="podium__medal podium__medal--third">🥉</div>
                    <Image
                      src={getAvatarSrc(topThree[2].avatarIndex)}
                      roundedCircle
                      width="65"
                      height="65"
                      className="podium__avatar--third shadow-sm"
                      alt={`Avatar de ${topThree[2].username}`}
                    />
                    <div className="podium__username">{topThree[2].username}</div>
                    <small className="podium__points">{topThree[2].stats} pts</small>
                  </div>
                )}
              </div>

              {/* 📋 Lista de los demás jugadores */}
              <div className="ranking-list">
                {rest.length > 0 ? (
                  rest.map((user, i) => (
                    <div key={user._id} className="ranking-item">
                      <div className="ranking-item__left">
                        <span className="ranking-item__position">#{i + 4}</span>
                        <Image
                          src={getAvatarSrc(user.avatarIndex)}
                          roundedCircle
                          width="40"
                          height="40"
                          className="ranking-item__avatar"
                          alt={`Avatar de ${user.username}`}
                        />
                        <strong className="ranking-item__username">{user.username}</strong>
                      </div>
                      <span className="ranking-item__points">{user.stats} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="ranking-list__empty">No hay más jugadores</p>
                )}
              </div>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}
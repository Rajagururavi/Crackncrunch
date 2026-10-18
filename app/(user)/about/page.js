
"use client";

export default function AboutPage() {
  return (
    <>
      <style jsx>{`
        .about-page {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: Arial, sans-serif;
          background: #fff;
        }

        .terms-banner {
          width: 100%;
          height: 500px;
          margin-top: 110px;
          position: relative;
          overflow: hidden;
        }

        .terms-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .terms-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }

        .banner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
          z-index: 2;
        }

        .banner-text a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }

        .banner-text a:hover {
          color: #f5deb3;
        }

        .about-section {
          width: 100%;
          padding: 90px 8%;
          background: #fff;
          box-sizing: border-box;
        }

        .about-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 70px;
          flex-wrap: wrap;
        }

        .about-content {
          flex: 1;
          min-width: 320px;
        }

        .about-tag {
          color: #c89b3c;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
          display: block;
        }

        .about-content h2 {
          font-size: 40px;
          line-height: 1.25;
          color: #222;
          margin-bottom: 25px;
          font-weight: 700;
        }

        .about-content p {
          font-size: 16px;
          color: #666;
          line-height: 1.9;
          margin-bottom: 20px;
        }

        .about-image {
          flex: 1;
          min-width: 320px;
        }

        .about-image img {
          width: 100%;
          border-radius: 25px;
          object-fit: cover;
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.12);
        }

        .middle-banner {
          width: 100vw;
          height: 500px;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          position: relative;
        }

        .middle-banner img {
          width: 100%;
          height: 78%;
          object-fit: cover;
          display: block;
        }

        .middle-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 78%;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }

        .middle-banner .banner-text {
          margin-top: -50px;
          width: 90%;
        }

        .nutrition-banner {
          width: 100vw;
          min-height: 650px;
          margin-left: calc(-50vw + 50%);
          position: relative;
          overflow: hidden;
        }

        .nutrition-banner img {
          width: 100%;
          height: 63%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }

        .nutrition-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 63%;
          background: rgba(0, 0, 0, 0.65);
          z-index: 1;
        }

        .nutrition-overlay {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 650px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 80px;
          padding-left: 4%;
          padding-right: 8%;
          margin-top: -80px;
          padding-bottom: 90px;
          box-sizing: border-box;
          color: #fff;
        }

        .nutrition-left {
          flex: 1.2;
        }

        .nutrition-tag {
          color: #d8b36a;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 20px;
        }

        .nutrition-left h2 {
          font-size: 40px;
          line-height: 1.3;
          margin-bottom: 25px;
          font-weight: 700;
        }

        .nutrition-left p {
          font-size: 17px;
          line-height: 1.9;
          color: #eee;
        }

        .nutrition-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .nutrition-box h3 {
          font-size: 28px;
          margin-bottom: 12px;
          color: #fff;
        }

        .nutrition-box p {
          color: #eee;
          line-height: 1.8;
          font-size: 15px;
        }

        .choose-container {
          width: 100%;
          display: flex;
          gap: 50px;
          max-height: 300px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 25px 65px rgba(0, 0, 0, 0.15);
          border-radius: 30px;
          box-sizing: border-box;
          margin-top: -200px;
          flex-wrap: wrap;
          transform: translateY(-20px);
        }

        .choose-column {
          flex: 1;
        }

        .choose-tag {
          color: #c89b3c;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 18px;
          margin-top: 40px;
          margin-left: 50px;
        }

        .choose-column h2 {
          font-size: 25px;
          line-height: 1.2;
          margin: 10px 0 8px 50px;
          color: #666;
        }

        .choose-column p {
          font-size: 14px;
          line-height: 1.9;
          color: #666;
          margin: 0 50px 8px 50px;
        }

        .choose-item {
          margin-bottom: 12px;
        }

        .choose-item h3 {
          font-size: 25px;
          line-height: 1.2;
          margin: 25px 50px 0 50px;
          color: #666;
        }

        .choose-item p {
          font-size: 14px;
          line-height: 1.5;
          color: #666;
          margin: 0 50px 8px 50px;
        }

        .dryfruit-banner {
          width: 100vw;
          height: 320px;
          position: relative;
          overflow: hidden;
          margin-top: 25px;
          margin-left: calc(-50vw + 50%);
        }

        .dryfruit-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .dryfruit-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
        }

        .dryfruit-banner-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          text-align: center;
          max-width: 700px;
          width: 90%;
        }

        .dryfruit-banner-content h1 {
          color: #fff;
          font-size: 55px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 18px;
        }

        .dryfruit-banner-content span {
          color: #fff;
          font-size: 18px;
          line-height: 1.7;
          display: block;
          white-space: nowrap;
          margin-left: -200px;
        }

        .order-btn {
          display: inline-block;
          margin-top: 25px;
          padding: 14px 35px;
          background: #d4a017;
          color: #fff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          border-radius: 50px;
          transition: 0.3s;
        }

        .order-btn:hover {
          background: #b8860b;
        }

        .work-section {
          width: 100%;
          text-align: center;
          padding: 90px 20px 60px;
        }

        .work-section h5 {
          color: #c58b1b;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }

        .work-section h2 {
          font-size: 48px;
          font-weight: 800;
          color: #111;
          margin-bottom: 20px;
        }

        .work-section p {
          max-width: 850px;
          margin: auto;
          font-size: 18px;
          line-height: 1.8;
          color: #666;
          white-space: nowrap;
        }

        .steps-container {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          padding: 20px;
          box-sizing: border-box;
        }

        .step-box {
          width: 280px;
          background: #fff;
          padding: 35px 25px;
          border-radius: 25px;
          text-align: center;
          border: 2px solid transparent;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
          transition: 0.4s;
        }

        .step-box:hover {
          border: 2px solid #000;
          transform: translateY(-10px);
        }

        .step-icon {
          width: 70px;
          height: 70px;
          border: 3px solid #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          font-size: 32px;
          font-weight: 700;
          color: #000;
          background: #fff;
          transition: 0.4s;
        }

        .step-box:hover .step-icon {
          background: #000;
          color: #fff;
        }

        .step-box h3 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #111;
        }

        .step-box p {
          font-size: 16px;
          line-height: 1.7;
          color: #666;
        }

        .learn-btn-wrapper {
          width: 100%;
          text-align: center;
          margin-top: 40px;
        }

        .learn-more-btn {
          display: inline-block;
          padding: 14px 38px;
          background: #000;
          color: #fff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          border-radius: 50px;
          transition: 0.3s;
        }

        .learn-more-btn:hover {
          background: #d4a017;
          color: #fff;
        }

        .about-page p {
          text-align: justify;
          text-justify: inter-word;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        @media screen and (max-width: 1024px) {
          .about-section {
            padding: 70px 5%;
          }

          .about-container {
            gap: 50px;
            align-items: flex-start;
          }

          .about-content {
            flex: 1;
          }

          .about-image {
            flex: 1;
            padding-top: 20px;
            margin-bottom: 30px;
          }

          .about-content h2 {
            font-size: 34px;
            line-height: 1.4;
          }

          .about-content p {
            font-size: 15px;
            line-height: 2;
            margin-bottom: 30px;
          }

          .about-image img {
            width: 100%;
            border-radius: 20px;
          }

          .middle-banner {
            height: 420px;
          }

          .middle-banner img,
          .middle-banner::before {
            height: 100%;
          }

          .middle-banner .banner-text {
            width: 90%;
            margin-top: 0;
          }

          .middle-banner .banner-text h1 {
            font-size: 32px;
          }

          .middle-banner .banner-text span {
            display: block;
            margin-top: 12px;
            font-size: 15px;
            line-height: 1.9;
            white-space: normal;
          }

          .nutrition-banner {
            min-height: auto;
          }

          .nutrition-banner img,
          .nutrition-banner::before {
            height: 100%;
          }

          .nutrition-overlay {
            flex-direction: column;
            align-items: flex-start;
            gap: 45px;
            margin-top: 0;
            padding: 60px 5%;
          }

          .nutrition-left,
          .nutrition-right {
            width: 100%;
          }

          .nutrition-left h2 {
            font-size: 34px;
            line-height: 1.4;
          }

          .nutrition-left p {
            font-size: 15px;
            line-height: 2;
          }

          .nutrition-box h3 {
            font-size: 24px;
          }

          .nutrition-box p {
            line-height: 1.9;
          }
        }

        @media screen and (max-width: 768px) {
          .terms-banner {
            height: 220px;
            margin-top: 85px;
          }

          .banner-text {
            width: 92%;
          }

          .banner-text h1 {
            font-size: 28px;
          }

          .banner-text span,
          .banner-text a {
            font-size: 13px;
          }

          .about-section {
            padding: 55px 5%;
          }

          .about-container {
            flex-direction: column;
            gap: 35px;
          }

          .about-content,
          .about-image {
            width: 100%;
          }

          .about-content h2 {
            font-size: 28px;
            line-height: 1.4;
          }

          .about-content p br {
            display: none;
          }

          .about-content p {
            font-size: 14px;
            line-height: 2;
            margin-bottom: 35px;
          }

          .about-image {
            margin-top: 10px;
            margin-bottom: 35px;
          }

          .about-image img {
            border-radius: 18px;
          }

          .middle-banner {
            height: 320px;
          }

          .middle-banner .banner-text {
            width: 92%;
          }

          .middle-banner .banner-text h1 {
            font-size: 24px;
            line-height: 1.4;
          }

          .middle-banner .banner-text span {
            font-size: 13px;
            line-height: 1.8;
            margin-top: 12px;
            display: block;
            white-space: normal;
          }

          .nutrition-overlay {
            padding: 50px 5%;
            gap: 35px;
          }

          .nutrition-left h2 {
            font-size: 28px;
            line-height: 1.5;
          }

          .nutrition-tag {
            font-size: 13px;
          }

          .nutrition-left p,
          .nutrition-box p {
            font-size: 14px;
            line-height: 1.9;
          }

          .nutrition-box h3 {
            font-size: 21px;
          }
        }

        @media screen and (max-width: 480px) {
          .terms-banner {
            height: 180px;
          }

          .banner-text h1 {
            font-size: 22px;
          }

          .about-section {
            padding: 45px 4%;
          }

          .about-container {
            gap: 28px;
          }

          .about-content h2 {
            font-size: 23px;
          }

          .about-content p {
            font-size: 13px;
            line-height: 1.9;
            margin-bottom: 30px;
          }

          .about-image {
            margin-top: 5px;
            margin-bottom: 30px;
          }

          .middle-banner {
            height: 280px;
          }

          .middle-banner .banner-text h1 {
            font-size: 20px;
          }

          .middle-banner .banner-text span {
            font-size: 12px;
            line-height: 1.7;
          }

          .nutrition-overlay {
            padding: 40px 4%;
          }

          .nutrition-left h2 {
            font-size: 23px;
          }

          .nutrition-box h3 {
            font-size: 18px;
          }

          .nutrition-left p,
          .nutrition-box p {
            font-size: 13px;
            line-height: 1.8;
          }
        }

        @media screen and (max-width: 1024px) {
          .choose-container {
            max-height: none;
            overflow: visible;
            gap: 30px;
            margin-top: 40px;
          }

          .choose-column {
            flex: 100%;
          }

          .choose-tag,
          .choose-column h2,
          .choose-column p,
          .choose-item h3,
          .choose-item p {
            margin-left: 20px;
          }

          .choose-column h2 {
            font-size: 22px;
          }

          .choose-item h3 {
            font-size: 20px;
          }
        }

        @media screen and (max-width: 768px) {
          .choose-container {
            flex-direction: column;
            padding-bottom: 20px;
          }

          .choose-tag,
          .choose-column h2,
          .choose-column p,
          .choose-item h3,
          .choose-item p {
            margin-left: 15px;
            margin-right: 15px;
          }

          .choose-tag {
            margin-top: 20px;
            font-size: 13px;
          }

          .choose-column h2 {
            font-size: 20px;
            line-height: 1.3;
          }

          .choose-item h3 {
            font-size: 18px;
          }

          .choose-column p,
          .choose-item p {
            font-size: 13px;
            line-height: 1.7;
          }
        }

        @media screen and (max-width: 480px) {
          .choose-container {
            border-radius: 20px;
          }

          .choose-tag,
          .choose-column h2,
          .choose-column p,
          .choose-item h3,
          .choose-item p {
            margin-left: 12px;
            margin-right: 12px;
          }

          .choose-tag {
            margin-top: 15px;
          }

          .choose-column h2 {
            font-size: 18px;
          }

          .choose-item h3 {
            font-size: 16px;
          }

          .choose-column p,
          .choose-item p {
            font-size: 12px;
          }
        }

        @media (max-width: 1200px) {
          .dryfruit-banner-content h1 {
            font-size: 48px;
          }

          .dryfruit-banner-content span {
            font-size: 16px;
            margin-left: 0;
            white-space: normal;
          }

          .work-section h2 {
            font-size: 42px;
          }
        }

        @media (max-width: 992px) {
          .dryfruit-banner {
            height: 280px;
          }

          .dryfruit-banner-content h1 {
            font-size: 40px;
          }

          .dryfruit-banner-content span {
            font-size: 15px;
            line-height: 1.6;
          }

          .order-btn {
            padding: 12px 28px;
            font-size: 16px;
          }

          .work-section {
            padding: 70px 20px 50px;
          }

          .work-section h2 {
            font-size: 36px;
          }

          .work-section p {
            font-size: 16px;
            white-space: normal;
          }

          .steps-container {
            gap: 20px;
          }

          .step-box {
            width: 45%;
          }
        }

        @media (max-width: 768px) {
          .dryfruit-banner {
            height: 250px;
          }

          .dryfruit-banner-content {
            width: 95%;
          }

          .dryfruit-banner-content h1 {
            font-size: 32px;
          }

          .dryfruit-banner-content span {
            font-size: 14px;
          }

          .order-btn {
            margin-top: 18px;
            padding: 10px 24px;
            font-size: 15px;
          }

          .work-section h5 {
            font-size: 14px;
          }

          .work-section h2 {
            font-size: 30px;
          }

          .work-section p {
            font-size: 15px;
            line-height: 1.7;
          }

          .step-box {
            width: 100%;
          }

          .step-box h3 {
            font-size: 22px;
          }

          .step-box p {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .dryfruit-banner {
            height: 220px;
          }

          .dryfruit-banner-content h1 {
            font-size: 26px;
          }

          .dryfruit-banner-content span {
            font-size: 13px;
          }

          .order-btn {
            padding: 9px 20px;
            font-size: 14px;
          }

          .work-section {
            padding: 60px 15px 40px;
          }

          .work-section h2 {
            font-size: 25px;
          }

          .work-section p {
            font-size: 14px;
          }

          .step-box {
            padding: 30px 20px;
          }

          .step-icon {
            width: 60px;
            height: 60px;
            font-size: 26px;
          }
        }

        @media (max-width: 768px) {
          .learn-btn-wrapper {
            margin-top: 30px;
          }

          .learn-more-btn {
            padding: 12px 30px;
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .learn-more-btn {
            padding: 10px 24px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="about-page">
        <div className="terms-banner">
          <img src="/uploads/about1.png" alt="About Us" />

          <div className="banner-text">
            <h1>ABOUT US</h1>
            <a href="/">Home</a>
            <span> &gt;&gt; </span>
            <span>About Us</span>
          </div>
        </div>

        <section className="about-section">
          <div className="about-container">
            <div className="about-content">
              <span className="about-tag">WHO WE ARE</span>

              <h2>
                Nourishing Lives with
                <br />
                Nature’s Finest Goodness
              </h2>

              <p>
                At <strong>Crack n crunch,</strong> we believe
                healthy living begins with what you eat. We source
                the finest nuts, dry fruits, seeds, and superfoods
                from trusted farms and process them with the highest
                quality standards to deliver purity, freshness, and
                taste in every pack.
              </p>

              <p>
                From everyday snacking to premium gifting and bulk
                supply, Crack n crunch is committed to providing
                natural, nutrient-rich foods that support better
                lifestyles. Our products are carefully selected,
                hygienically packed, and crafted for those who value
                quality, wellness, and sustainability.
                <br />
                <br />
              </p>
            </div>

            <div className="about-image">
              <img
                src="/uploads/5.png"
                alt="Premium dry fruits"
              />
            </div>
          </div>

          <div className="middle-banner">
            <img
              src="/uploads/about.png"
              alt="Naturally sourced products"
            />

            <div className="banner-text">
              <h1>Pure. Natural. Thoughtfully Sourced.</h1>

              <span>
                At Crack n crunch, we bring you premium nuts, dry
                fruits, seeds, and superfoods—carefully selected for
                quality, freshness, and wholesome nutrition.
              </span>
            </div>
          </div>

          <div className="about-container">
            <div className="about-content">
              <h2>The Better Source of Energy!</h2>

              <p>
                At <strong>Crack n crunch,</strong> we believe true
                energy comes from nature. Our premium nuts, dry
                fruits, seeds, and superfoods are carefully sourced
                from trusted farms and processed under strict
                quality standards to retain their natural
                nutrition, freshness, and taste.
                <br />
                <br />
                Whether you need a healthy daily snack, clean energy
                for an active lifestyle, or premium selections for
                gifting and bulk supply, Crack n crunch delivers
                wholesome goodness you can rely on. Every product is
                packed with essential nutrients, natural proteins,
                and antioxidants—helping you stay energized,
                focused, and healthy every day.
                <br />
                <br />
              </p>
            </div>

            <div className="about-image">
              <img
                src="/uploads/6.png"
                alt="Healthy natural snacks"
              />
            </div>
          </div>

          <div className="nutrition-banner">
            <img
              src="/uploads/about2.png"
              alt="Natural nutrition"
            />

            <div className="nutrition-overlay">
              <div className="nutrition-left">
                <span className="nutrition-tag">What we offer</span>

                <h2>
                  Select Natural Nutrition for a Healthier Lifestyle
                  and a Better Tomorrow
                </h2>

                <p>
                  At Crack n crunch, we bring you premium nuts, dry
                  fruits, seeds, berries, and superfoods that support
                  everyday wellness and long-term health. From clean
                  energy snacks to thoughtful gifting and bulk
                  supply, our products are carefully sourced,
                  hygienically packed, and delivered with
                  uncompromising quality.
                </p>
              </div>

              <div className="nutrition-right">
                <div className="nutrition-box">
                  <h3>Vision</h3>

                  <p>
                    To become a trusted global brand in natural
                    foods—promoting healthier living through
                    premium, responsibly sourced nutrition.
                  </p>
                </div>

                <div className="nutrition-box">
                  <h3>Mission</h3>

                  <p>
                    To deliver high-quality nuts, dry fruits, seeds,
                    and superfoods with integrity, freshness, and
                    care—making wholesome nutrition accessible for
                    every lifestyle.
                  </p>
                </div>

                <div className="nutrition-box">
                  <h3>Proverb</h3>

                  <p>
                    Good health begins with what you choose to eat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="choose-container">
            <div className="choose-column">
              <span className="choose-tag">WHY CHOOSE US</span>

              <h2>
                Let’s experience the power of natural nutrition.
              </h2>

              <p>
                Crack n crunch delivers premium-quality nuts, dry
                fruits, and superfoods—carefully sourced,
                hygienically packed, and trusted for everyday
                wellness, gifting, and bulk supply.
              </p>
            </div>

            <div className="choose-column">
              <div className="choose-item">
                <h3>Premium Sourcing</h3>

                <p>
                  We partner with trusted farms and suppliers to
                  bring you the highest-grade nuts, dry fruits,
                  seeds, and berries—pure, natural, and responsibly
                  sourced.
                </p>
              </div>

              <div className="choose-item">
                <h3>Quality &amp; Freshness</h3>

                <p>
                  Every product is hygienically processed and
                  <br />
                  packed under strict quality controls to preserve
                  <br />
                  taste, texture, and essential nutrients.
                </p>
              </div>
            </div>

            <div className="choose-column">
              <div className="choose-item">
                <h3>Expert Guidance</h3>

                <p>
                  From healthy snacking to bulk and gifting
                  solutions, our team helps you choose the right
                  products for your lifestyle and business needs.
                </p>
              </div>

              <div className="choose-item">
                <h3>Reliable Supply</h3>

                <p>
                  We offer consistent availability for retail,
                  corporate gifting, and wholesale orders—delivered
                  on time, every time.
                </p>
              </div>
            </div>
          </div>

          <div className="dryfruit-banner">
            <img
              src="/uploads/about3.png"
              alt="Premium nuts and dry fruits"
            />

            <div className="dryfruit-banner-content">
              <h1>
                Premium Nuts &amp;
                <br />
                Dry Fruits Store
              </h1>

              <span>
                Fresh, natural, and high-quality nuts, dry fruits,
                dates, seeds, and healthy snack mixes—carefully
                sourced for taste, purity, and nutrition.
              </span>

              <a href="/" className="order-btn">
                Order Now
              </a>
            </div>
          </div>

          <div className="work-section">
            <h5>HOW IT WORKS</h5>

            <h2>Easy Steps &amp; Solutions</h2>

            <p>
              Getting premium, healthy nutrition from Crack n crunch
              is simple. From selection to delivery, we follow a
              streamlined process to
              <br />
              ensure freshness, quality, and satisfaction in every
              order.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-box">
              <div className="step-icon">✓</div>

              <h3>Product Selection</h3>

              <p>
                Choose from our wide range of premium nuts, dry
                fruits, seeds, berries, powders, and curated gift
                packs—carefully sourced for quality and taste.
              </p>

              <div className="learn-btn-wrapper">
                <a href="/" className="learn-more-btn">
                  Learn More
                </a>
              </div>
            </div>

            <div className="step-box">
              <div className="step-icon">✓</div>

              <h3>Quality Processing</h3>

              <p>
                Every product is hygienically cleaned, sorted, and
                packed under strict quality standards to preserve
                natural nutrition, freshness, and flavor.
              </p>

              <div className="learn-btn-wrapper">
                <a href="/" className="learn-more-btn">
                  Learn More
                </a>
              </div>
            </div>

            <div className="step-box">
              <div className="step-icon">✓</div>

              <h3>Custom Solutions</h3>

              <p>
                Whether it’s daily snacking, festive gifting, or
                bulk/wholesale requirements, we offer flexible
                packaging and tailored solutions to meet your
                needs.
              </p>

              <div className="learn-btn-wrapper">
                <a href="/" className="learn-more-btn">
                  Learn More
                </a>
              </div>
            </div>

            <div className="step-box">
              <div className="step-icon">✓</div>

              <h3>Fast &amp; Reliable Delivery</h3>

              <p>
                Your order is safely packed and delivered on time,
                ensuring you receive farm-fresh goodness straight to
                your doorstep.
              </p>

              <div className="learn-btn-wrapper">
                <a href="/" className="learn-more-btn">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
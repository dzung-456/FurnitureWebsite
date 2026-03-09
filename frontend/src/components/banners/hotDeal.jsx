import React, { useState, useEffect } from "react";
import adDiscount from "../../assets/imgs/ad-discount.png";
import adTimer from "../../assets/imgs/ad-timer.png";

export function HotDeal() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    // Set target date to 7 days from now
    const countDownDate = new Date().getTime() + (7 * day);

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / day);
        const hours = Math.floor((distance % day) / hour);
        const minutes = Math.floor((distance % hour) / minute);
        const seconds = Math.floor((distance % minute) / second);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="furniture-ad pb-100" style={{ marginTop: "0px" }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-xxl-7 col-xl-6">
            <div
              className="furniture-ad__item h-100 bg-image"
              style={{ backgroundImage: `url(${adDiscount})` }}
            >
              <div className="fad-content">
                <h6 className="text-white mb-20 text-uppercase">
                  Nội thất GIÁ SỐC
                </h6>
                <h2 className="text-capitalize text-white">
                  Ưu đãi có giới hạn <br />
                  Giảm 30%
                </h2>
                <a className="border__btn-f mt-35" href="/productsList">
                  Mua ngay
                  <span>
                    <i className="fa-regular fa-angle-right"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-xxl-5 col-xl-6">
            <div
              className="furniture-ad__item h-100 bg-image"
              style={{ backgroundImage: `url(${adTimer})` }}
            >
              <div className="fad-content fad-timer text-center">
                <h6 className="text-white mb-20 text-uppercase">
                  Nội thất GIÁ SỐC
                </h6>
                <h2 className="text-capitalize text-white mb-30">
                  Ưu đãi trong tuần
                </h2>
                <div className="countdown-wrapper">
                  <ul>
                    <li>
                      <span id="days">{countdown.days}</span>ngày
                    </li>
                    <li>
                      <span id="hours">{countdown.hours}</span>giờ
                    </li>
                    <li>
                      <span id="minutes">{countdown.minutes}</span>phút
                    </li>
                    <li>
                      <span id="seconds">{countdown.seconds}</span>giây
                    </li>
                  </ul>
                </div>
                <a className="border__btn-f mt-40" href="/productsList">
                  Mua ngay
                  <span>
                    <i className="fa-regular fa-angle-right"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HotDeal;

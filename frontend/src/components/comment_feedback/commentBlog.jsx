import React from "react";
import userAvatar from "../../assets/imgs/user-02.png";

export function CommentBlog() {
  return (
    <div className="postbox__comment-wrapper">
      <div className="postbox__comment mb-60">
        <h3 className="postbox__comment-title">Bình luận (2)</h3>
        <ul>
          <li>
            <div className="postbox__comment-box d-sm-flex align-items-start">
              <div className="postbox__comment-info">
                <div className="postbox__comment-avatar">
                  <img src={userAvatar} alt="" />
                </div>
              </div>
              <div className="postbox__comment-text ">
                <div className="postbox__comment-name">
                  <span className="post-meta"> 22/11/2024</span>
                  <h5>
                    <a href="#">Eleanor Fant</a>
                  </h5>
                </div>
                <p>
                  One’s of the best template out of there. design, code quality,
                  updates etc everything you needs guys, buy it you won’t regret
                  it!
                </p>
                <div className="postbox__comment-reply">
                  <a href="#">Trả lời</a>
                </div>
              </div>
            </div>
            <ul className="children">
              <li>
                <div className="postbox__comment-box d-sm-flex align-items-start">
                  <div className="postbox__comment-info">
                    <div className="postbox__comment-avatar">
                      <img src={userAvatar} alt="" />
                    </div>
                  </div>
                  <div className="postbox__comment-text ">
                    <div className="postbox__comment-name">
                      <span className="post-meta"> 22/11/2024</span>
                      <h5>
                        <a href="#">Alexander Ljung</a>
                      </h5>
                    </div>
                    <p>
                      This theme is super awesome! But I had one small issue
                      with link option in parallax portfolio. The other day!{" "}
                    </p>
                    <div className="postbox__comment-reply">
                      <a href="#">Trả lời</a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
          <li>
            <div className="postbox__comment-box d-sm-flex align-items-start">
              <div className="postbox__comment-info">
                <div className="postbox__comment-avatar">
                  <img src={userAvatar} alt="" />
                </div>
              </div>
              <div className="postbox__comment-text ">
                <div className="postbox__comment-name">
                  <span className="post-meta"> 22/11/2024</span>
                  <h5>
                    <a href="#">Thelma J. Hunter</a>
                  </h5>
                </div>
                <p>
                  His many legs, pitifully thin compared with the size of the
                  rest of him, waved about helplessly as he looked
                </p>
                <div className="postbox__comment-reply">
                  <a href="#">Trả lời</a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="postbox__comment-form">
        <h3 className="postbox__comment-form-title">Để lại bình luận</h3>

        <form action="#">
          <div className="row">
            <div className="col-xxl-12">
              <div className="postbox__comment-input">
                <textarea placeholder="Bình luận của bạn..."></textarea>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="postbox__comment-btn">
                <button className="fill-btn">
                  <span className="fill-btn-inner">
                    <span className="fill-btn-normal">Gửi bình luận</span>
                    <span className="fill-btn-hover">Gửi bình luận</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CommentBlog;

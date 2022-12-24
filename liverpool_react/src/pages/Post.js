import { Viewer } from "@toast-ui/react-editor";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Container, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Log from "../commons/Log";
import Top from "../commons/Top";
import { useAuthStore } from "../stores/RootStore";
import { customAxios } from "../utils/CustomAxios";
import tag1 from "../assets/img/tag1.PNG";
import tag2 from "../assets/img/tag2.PNG";
import img from "../assets/img/img.png";

const Post = () => {
  // useMemo useCallback 최적화 관련글
  // https://haragoo30.medium.com/usememo-usecallback%EC%9D%84-%EC%96%B8%EC%A0%9C-%EC%8D%A8%EC%95%BC%EB%90%98%EB%82%98-6a5e6f30f759
  // https://velog.io/@hyunjine/React-Rendering-Optimization

  const authStore = useAuthStore();
  const [post, setPost] = useState();
  const { postIdx } = useParams();
  const navigate = useNavigate();

  const deletePost = () => {
    if (window.confirm("정말 삭제하시겠습니까?") === false) {
      return;
    }

    customAxios
      .privateAxios({
        method: `delete`,
        url: `/api/v1/posts/${postIdx}`,
      })
      .then((response) => {
        if (response.status === 200) {
          alert("삭제되었습니다.");
          navigate("/", { replace: true });
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error?.response?.data?.detail != null) {
          alert(JSON.stringify(error?.response?.data?.detail));
        } else if (error?.response?.data?.message != null) {
          alert(error.response.data.message);
        } else {
          alert("오류가 발생했습니다. 관리자에게 문의하세요.");
        }
      })
      .finally(() => {});
  };

  const getPost = useCallback(() => {
    const selectedAxios =
      authStore.loginUser != null
        ? customAxios.privateAxios
        : customAxios.publicAxios;

    selectedAxios({
      method: `get`,
      url: `/api/v1/posts/${postIdx}`,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data.content);
          setPost(response.data.content);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        if (error?.response?.data?.detail != null) {
          alert(JSON.stringify(error?.response?.data?.detail));
        } else if (error?.response?.data?.message != null) {
          alert(error.response.data.message);
        } else {
          alert("오류가 발생했습니다. 관리자에게 문의하세요.");
        }
      })
      .finally(() => {});
  }, [authStore, postIdx]);

  useEffect(() => {
    if (isNaN(postIdx)) {
      alert("잘못된 접근입니다.");
      navigate("/", { replace: true });
      return;
    }

    if (authStore.loginUser !== undefined) {
      // 데이터 가져오는 함수 실행
      getPost();
    }
  }, [authStore, getPost, navigate, postIdx]);

  return (
    <div className="bg-white">
    <Top />
      <Container className="ps-5 pe-5 my-5">
        <h1>{post?.title}</h1>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span>
              <Image
                src={img}
                className="ratio ratio-1x1 rounded-circle me-2"
                style={{ width: "20px", height: "20px" }}
                alt="profile"
              />
              <strong>{post?.writer.id}</strong>
            </span>
            <span className="text-black-50 fw-light ms-3">
              {post?.createDate}
            </span>
          </div>
          
          {authStore.loginUser?.idx === post?.writer.idx ? (
            <div>
              <Button variant="outline-success" type="button" onClick={()=> navigate(`/update-post/${postIdx}`)}>
                수정
              </Button>
              <Button variant="outline-danger" className="ms-2" type="button" onClick={deletePost}>
                삭제
              </Button>
            </div>
          ) : null}
        </div>
        {post ? <Viewer initialValue={post.content} /> : null}
      </Container>
      <Card.Img
        variant="top"
        src={tag1}
        style={{ width: "120rem", margin: "auto" }}
      />
      <Card.Img
        variant="top"
        src={tag2}
        style={{ width: "120rem", margin: "auto" }}
      />
      <Log />
      </div>
  );
};

export default Post;

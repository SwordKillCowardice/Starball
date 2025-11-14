// src/components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // 可选：使用左箭头图标

const BackButton = ({ label = "返回" }) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1); // 返回上一页
    };

    return (
        <button
            onClick={goBack}
            style={{
                position:"absolute",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                marginBottom: "40px",
                marginLeft: "100px",
            }}
        >
            <FaArrowLeft />
            {label}
        </button>
    );
};

export default BackButton;

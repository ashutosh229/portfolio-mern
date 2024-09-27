import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login.jsx";
import HomePage from "./pages/HomePage.jsx";
import ManageSkills from "./pages/ManageSkills.jsx";
import ManageProjects from "./pages/ManageProjects.jsx";
import UpdateProject from "./pages/UpdateProject.jsx";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getUser } from "./store/slices/userSlice.js";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { getAllSkills } from "./store/slices/skillSlice.js";
import { getAllSoftwareApplications } from "./store/slices/softwareApplicationSlice.js";
import { getAllTimeline } from "./store/slices/timelineSlice.js";
import { getAllMessages } from "./store/slices/messageSlice.js";
import ManageTimeline from "./pages/ManageTimeline.jsx";
import { getAllProjects } from "./store/slices/projectSlice.js";
import ViewProject from "./pages/ViewProject.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
    dispatch(getAllSkills());
    dispatch(getAllSoftwareApplications());
    dispatch(getAllTimeline());
    dispatch(getAllMessages());
    dispatch(getAllProjects());
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/manage/skills" element={<ManageSkills />} />
        <Route path="/manage/timeline" element={<ManageTimeline />} />
        <Route path="/manage/projects" element={<ManageProjects />} />
        <Route path="/view/project/:id" element={<ViewProject />} />
        <Route path="/update/project/:id" element={<UpdateProject />} />
      </Routes>
      <ToastContainer position="bottom-right" theme="dark" />
    </Router>
  );
}

export default App;

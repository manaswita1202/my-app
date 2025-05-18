import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login"; // Import Login page
import Techpack from "./Techpack"; // Import Techpack page
import BuyerTechpack from "./BuyerTechpack"; // Import buyertechpack page
import HomePage from "./OrderCreation"; // Import Home page
import FabricAndTrims from "./FabricAndTrims";
import Layout from "./Layout";
import FabricDetail from "./FabricDetail"; // Import FabricDetail
import TrimDetail from "./TrimDetail";
import Vendors from "./Vendors";
import TaskBoard from "./TaskBoard";
import SampleIndentForm from "./SampleIndentForm";
import Activity from "./Activity";
import GanttChart from "./GanttChart";
import SampleTracker from "./SampleTracker";
import CalendarToDo from "./CalendarToDo"
import OrderTracker from "./OrderTracker";
import BOMPage from "./BOMPage";
import Generatetc from "./Generatetc";
import CostSheet from "./CostSheet";
import ApprovalStatus from "./ApprovalStatus";
import ViewFiles from "./StyleDocuments";
import ImageAnnotator from "./ImageAnnotation";
import InspirationForm from "./InspirationForm";

function App() {

  return (
    <Router>
      <Routes>
        {/* Redirect base URL to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<ApprovalStatus />} /> {/* Default Home Page */}
          <Route path="techpack/upload" element={<Techpack />} />
          <Route path="fabric-trims" element={<FabricAndTrims />} />
          <Route path="techpack/:buyer" element={<BuyerTechpack />} />
          <Route path="fabric/:fabricName" element={<FabricDetail />} />
          <Route path="trim/:trimName" element={<TrimDetail />} />
          <Route path="vendors" element={<Vendors />} />
          {<Route path="taskboard" element={<TaskBoard/>} />}
          <Route path="sample" element={<SampleIndentForm/>}/>
          <Route path="tna/activity" element={<Activity/>} />
          <Route path="tna/gantt-chart" element={<GanttChart/>} />
          {<Route path="tna/calendar-to-do" element={<CalendarToDo/>} />}
          <Route path="sample-tracker" element={<SampleTracker/>}/>
          <Route path="order-tracker" element={<OrderTracker/>} />
          <Route path="bom" element={<BOMPage/>} />
          <Route path="techpack/generate" element={<Generatetc />} />
          <Route path="costsheet" element={<CostSheet />} />
          <Route path="order-creation" element={<HomePage />} />
          <Route path="style-documents" element={<ViewFiles />} /> {/* Default Home Page */}
          <Route path="imageannotator" element={<ImageAnnotator/>} />
          <Route path="inspirationform" element={<InspirationForm/>} />

        </Route>      
        </Routes>
    </Router>
  );
}

export default App;
   
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const pdf = new jsPDF();
console.log(typeof pdf.html);

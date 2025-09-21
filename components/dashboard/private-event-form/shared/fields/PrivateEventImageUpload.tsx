// import { ReactElement, useRef } from "react";
// import { PrivateEventFieldsProps } from "../types/privateEventForm.types";

// const PrivateEventImageUpload = ({
//   formData,
//   actions,
//   errors,
// }: PrivateEventFieldsProps): ReactElement => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     actions.handleImageChange(file);
//   };

//   const handleRemoveImage = () => {
//     actions.handleImageChange(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-medium text-gray-900">Image (Optional)</h3>

//       <div className="flex items-center space-x-4">
//         <div className="flex-shrink-0">
//           {formData.image ? (
//             <div className="relative">
//               <img
//                 src={URL.createObjectURL(formData.image)}
//                 alt="Private event preview"
//                 className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
//               />
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
//                 title="Remove image"
//               >
//                 ×
//               </button>
//             </div>
//           ) : (
//             <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
//               <svg
//                 className="w-8 h-8 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                 />
//               </svg>
//             </div>
//           )}
//         </div>

//         <div className="flex-1">
//           <button
//             type="button"
//             onClick={handleUploadClick}
//             className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {formData.image ? "Change Image" : "Upload Image"}
//           </button>
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="hidden"
//             autoComplete="new-password"
//             data-lpignore="true"
//             data-form-type="other"
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             Upload an image to help customers visualize this private event offering.
//           </p>
//         </div>
//       </div>

//       {errors.image && (
//         <p className="text-red-600 text-sm">{errors.image}</p>
//       )}
//     </div>
//   );
// };

// export default PrivateEventImageUpload;

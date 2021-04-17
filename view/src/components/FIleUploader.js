import React from 'react';
import {FilePond, File, registerPlugin} from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

import 'filepond/dist/filepond.min.css';
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImagePreview, FilePondPluginImageExifOrientation);

/* interface FileUploaderProps {
    onUploadComplete: () => void;
    fileTypes: string[];
} */

const FileUploader = ({objectId, files, handleSetFiles}) => {
    //const [files, setFiles] = useState([]);
    
    return (
        <>
<FilePond
files={files}
onupdatefiles={handleSetFiles}
allowMultiple={true}
allowReorder={true}
dropOnPage
server={{
            process: {
              url: `http://localhost:5000/realtor-s-routines/us-central1/api/object/${objectId}/images`,
               headers: {
                 'Authorization': localStorage.getItem('AuthToken'),
               },
             /*   ondata: (formData) => {
                   
               formData.append('imageId', files[i].id);
               i++;
               return formData;
               }, */
                onload: (response) =>  response,
            
            }

           }}
           
    onreorderfiles={handleSetFiles}
name="files"
credits={false}
/>
{/* 
{console.log(files.length && files[0].serverId)} */}
        </>
    )
}
export default FileUploader;
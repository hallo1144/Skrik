import React, { useState } from "react";
import styled from "styled-components";
import { IconContext } from "react-icons";
import { AiOutlineFile, AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai";
import { DiJavascript1, DiCss3Full, DiHtml5, DiReact, DiPython } from "react-icons/di";
import { VscNewFile, VscNewFolder, VscCloudDownload, VscCollapseAll } from "react-icons/vsc";
import { TiDeleteOutline} from "react-icons/ti";
import { SiCplusplus, SiJson } from "react-icons/si";
import "./css/Structure.css";
// import { borderRadius } from "react-select/src/theme";

const FILE_ICONS = {
    js: <DiJavascript1 />,
    css: <DiCss3Full />,
    html: <DiHtml5 />,
    jsx: <DiReact />,
    py: <DiPython />,
    cpp: <SiCplusplus />,
    json: <SiJson />
};

const StyledTree = styled.div`
  line-height: 1.8;
  padding:5% 0%;
//   border:blue 1px solid;

`;
const Collapsible = styled.div`
  height: ${p => (p.isOpen ? "0" : "auto")};
  overflow: hidden;
`;

export default function Structure({projectName,returnNewFile,returnDelete,returnDownload,returnClickFile,fileList,treeStructure, setTree, resetStatus, onClickFile, onClickFolder, AddNewFile, SaveToTree, currentFilePath}) {
    
    const File = ({ name, filepath, focusOn }) => {
        let ext = name.split(".")[1];
        return (
            
                <div id={filepath} className={focusOn ? 'structureFile_Focus' :'structureFile'} filepath={filepath} key={filepath}>
                {FILE_ICONS[ext] || <AiOutlineFile />}
                <span className="fileSpan" 
                onClick={(event) => handleclickFile(event)} 
                    key={filepath + ' span'}>{name}</span>
                </div>
                
            
        );
    };
    const Folder = ({ name, children, folderpath, focusOn }) => {
        const [isOpen, setIsOpen] = useState(false);
        const handleToggle = e => {
            e.preventDefault();
            setIsOpen(!isOpen);
        };
        return (
            <div id={folderpath} className={focusOn ? 'structureFolder_Focus' : 'structureFolder'} folderpath={folderpath} key={folderpath}>
                <div className="folderLabel" onClick={handleToggle} key={folderpath + ' div'}>
                    {(!isOpen) ? <AiOutlineFolderOpen /> : <AiOutlineFolder />}
                    <span className="folderSpan" key={folderpath + ' span'} onClick={(event) => handleclickFolder(event)}>{name}</span>
                </div>
                <Collapsible isOpen={isOpen}>{children}</Collapsible>
            </div>
        );
    };
    const Input = ({ isFolder, filepath, focusOn }) => {
        return (
            <div id={filepath} className={focusOn ? "structureFile_Focus" : "structureFile"} filepath={filepath} key={filepath}>
                {isFolder ? <AiOutlineFolder /> : <AiOutlineFile />}
                <input className="inputSpan" placeholder={isFolder ? "Type folder name here" : "Type file name here"} onKeyPress={(event) => handlePressEnter(event, isFolder)}></input>
            </div>
        )
    }
    const Tree = ({ children }) => {
        return <StyledTree>{children}</StyledTree>;
    };
    Tree.Input = Input;
    Tree.File = File;
    Tree.Folder = Folder;
    const handlePressEnter = (event, isFolder) => {
        if (event.key === 'Enter') {
            let newFileName = event.target.value
            let path = SaveToTree(newFileName, isFolder)
            if(fileList.includes(path)){
                alert("filename exists")
            }
            else{
                returnNewFile(path)
            }
            
        }
    }
    const handleAddNewFile = () => {
        AddNewFile(false)
    }
    const handleAddNewFolder = () => {
        AddNewFile(true)
    }
    const StructureHeader = ({ projectName }) => {
        return (
            <div className='Header'>
                <div className="header_title">
                    <span className="header_titleName">{projectName}</span>
                </div>
                <div className='Navbar'>
                    <IconContext.Provider value={{ className: 'navbar_icons' }}>
                        <div className='navbar_bar'>
                            <VscNewFile onClick={() => handleAddNewFile()} />
                            <VscNewFolder onClick={() => handleAddNewFolder()} />
                            <VscCloudDownload onClick={() => returnDownload()}  />
                            <TiDeleteOutline onClick={() => returnDelete()} />
                            <VscCollapseAll onClick={() => { alert("Collapse All") }} />
                        </div>
                    </IconContext.Provider>
                </div>
            </div>
        )
    }
    let filepath = '';
    const displayStruct = (ele, i) => {
        if (Array.isArray(ele)) {
            return ele.map(displayStruct)
        }
        else if (ele === "EOF") {
            let spl = filepath.split("_")
            filepath = filepath.substr(0, filepath.length - 1 - spl[spl.length - 2].length)
        }
        else if (ele.type === "file") {
            return <Tree.File name={ele.name} filepath={filepath + i} focusOn={ele.status === 'on'} />
        }
        else if (ele.type === "folder") {
            filepath += `${i}_`
            return (
                <Tree.Folder name={ele.name} folderpath={filepath.substr(0, filepath.length - 1)} focusOn={ele.status === 'innestopenFocus'}>
                    {
                        displayStruct(ele.data)
                    }
                </Tree.Folder>
            )
        }
        else if (ele.type === "blankFile") {
            if (ele.displayAddBlank)
                return (
                    <Tree.Input isFolder={false} filepath={filepath + i} focusOn={ele.status === 'false'} />
                )
        }
        else if (ele.type === "blankFolder") {
            if (ele.displayAddBlank)
                return (
                    <Tree.Input isFolder={true} filepath={filepath + i} focusOn={ele.status === 'false'} />
                )
        }

    }
    
    const handleclickFile = (event) => {
        let fp = event.target.parentNode.id
        resetStatus()
        const filename = onClickFile(String(fp))
        returnClickFile({"type":"file","name":filename})
    }
    const handleclickFolder = (event) => {
        let fp = event.target.parentNode.parentNode.id
        resetStatus()
        const foldername = onClickFolder(String(fp))
        returnClickFile({"type":"folder","name":foldername})
    }
    return (
        <div className="App">
            <StructureHeader projectName={projectName} />
            <Tree>
                {displayStruct(treeStructure)}
            </Tree>
            <rightClick/>
        </div>
    );
}

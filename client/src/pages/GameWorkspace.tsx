import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import * as GUI from '@babylonjs/gui';
import ResidentialBuildings from '../structures/buildings/Residential_Buildings.json';
import OfficeBuildings from '../structures/buildings/Office.json';
import IndustrialBuildings from '../structures/buildings/Industrial.json';
import MedicalBuildings from '../structures/buildings/Medical.json';
import Roads from '../structures/infrastructure/Roads.json';
import WaterInfrastructure from '../structures/infrastructure/Water.json';
import PowerInfrastructure from '../structures/infrastructure/Power.json';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CHAINVILLE_EMOJIS } from '../constants';

const GRID_SIZE = 40;
const CELL_SIZE = 40;

interface LandCell {
  id: number;
  x: number;
  z: number;
  acquired: boolean;
}

interface BuildOption {
  id: string;
  name: string;
  icon: string;
  modelFile?: string;
}

interface TopPanelInfo {
  balance: number;
  walletAddress: string;
}

interface StructureInstance {
  type: string;
  category: string;
  id: string;
  mesh: BABYLON.Mesh;
  x: number;
  y: number;
  z: number;
}

interface GridCell {
  mesh: BABYLON.Mesh;
  acquired: boolean;
  structures: StructureInstance[];
}


type SelectedStructure = {
  type: string;
  category:string;
  id: string;
  name: string;
  modelFile: string;
  footprint?: {
    width: number;
    length: number;
  };
  // Include other properties that might be used elsewhere
  cost: number;
};





const GameWorkspace: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const gridCellsRef = useRef<{[key: string]: GridCell}>({});
  const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);

// Organize structures by their actual categories
const structuresByCategory = {
  residential: ResidentialBuildings.residentialBuildings,
  office: OfficeBuildings.officeBuildings,
  industry: IndustrialBuildings.industrialBuildings,
  hospital: MedicalBuildings.medicalBuildings,
  roads: Roads.roads,
  waterSupply: WaterInfrastructure.waterInfrastructure,
  powerLines: PowerInfrastructure.powerInfrastructure
};
  
  const [showLandPanel, setShowLandPanel] = useState<boolean>(false);
  const [showBuildingPanel, setShowBuildingPanel] = useState<boolean>(false);
  const [showInfrastructurePanel, setShowInfrastructurePanel] = useState<boolean>(false);

  const SUB_GRID_SIZE = 40; // 4x4 sub-grid within each cell (logical, not physical)
  const STRUCTURE_SCALE = 10; // Structures will be 20% of the sub-cell size
  const PREVIEW_HEIGHT_OFFSET = 1;

  const cameraRef = useRef<BABYLON.ArcRotateCamera| null>(null);

  const [availableLand, setAvailableLand] = useState<LandCell[]>([]);

  let subPanelConfig: GUI.StackPanel;

  const [buildingOptions, setBuildingOptions] = useState<BuildOption[]>([
    { id: 'residential', name: 'Residential Building', icon: '🏘️' },
    { id: 'office', name: 'Office Building', icon: '🏢' },
    { id: 'industry', name: 'Industrial Building', icon: '🏭' },
    { id: 'hospital', name: 'Hospital', icon: '🏥' },
  ]);

  const [infrastructureOptions, setInfrastructureOptions] = useState<BuildOption[]>([
    { id: 'powerLines', name: 'Power Lines', icon: '⚡' },
    { id: 'roads', name: 'Roads', icon: '🛣️' },
    { id: 'waterSupply', name: 'Water Supply', icon: '💧' },
  ]);

  const [selectedStructure, setSelectedStructure] = useState<SelectedStructure | null>(null);
  const [structurePreview, setStructurePreview] = useState<BABYLON.Mesh | null>(null);

  const getStructureColor = (structureId: string): BABYLON.Color3 => {
    switch (structureId) {
      case 'residential': return new BABYLON.Color3(0.2, 0.4, 0.8);
      case 'office': return new BABYLON.Color3(0.8, 0.8, 0.2);
      case 'industry': return new BABYLON.Color3(0.8, 0.2, 0.2);
      case 'hospital': return new BABYLON.Color3(0.2, 0.8, 0.2);
      case 'powerLines': return new BABYLON.Color3(1, 0.6, 0);
      case 'roads': return new BABYLON.Color3(0.3, 0.3, 0.3);
      case 'waterSupply': return new BABYLON.Color3(0, 0.6, 0.8);
      default: return new BABYLON.Color3(0.5, 0.5, 0.5);
    }
  };



  const [topPanelInfo, setTopPanelInfo] = useState<TopPanelInfo>({
    balance: 1000000,
    walletAddress: '0x1234...5678',
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = createScene(engine);
    sceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    setupCameraControls(scene);

    return () => {
      engine.dispose();
    };
  }, []);

  const createScene = (engine: BABYLON.Engine): BABYLON.Scene => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8);

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      -Math.PI / 2,  // alpha
      Math.PI / 3,   // beta
      100,           // radius
      new BABYLON.Vector3(GRID_SIZE * CELL_SIZE / 2, 0, GRID_SIZE * CELL_SIZE / 2),
      scene
    );
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 150;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.2;

    cameraRef.current = camera;


    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5

    // Create grid
    createGrid(scene);

    // Create GUI
    createGUI(scene);

    return scene;
  };

  const createGrid = (scene: BABYLON.Scene) => {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const cell = BABYLON.MeshBuilder.CreateGround(`cell_${x}_${z}`, {
          width: CELL_SIZE,
          height: CELL_SIZE
        }, scene);
        cell.position.x = x * CELL_SIZE + CELL_SIZE / 2;
        cell.position.z = z * CELL_SIZE + CELL_SIZE / 2;
        const material = new BABYLON.StandardMaterial(`cellMat_${x}_${z}`, scene);
        material.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
        cell.material = material;

        gridCellsRef.current[`${x}_${z}`] = {
          mesh: cell,
          acquired: false,
          structures: []
        };

        cell.actionManager = new BABYLON.ActionManager(scene);
        cell.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            console.log(`Clicked on cell ${x}, ${z}`);
            //handleCellClick(x, z);
          }
        ));
      }
    }
  };

  // const handleStructureSelection = (type: 'building' | 'infrastructure', structureId: string) => {
  //   console.log(`Selected ${type}: ${structureId}`);
  //   const option = type === 'building' 
  //     ? buildingOptions.find(b => b.id === structureId)
  //     : infrastructureOptions.find(i => i.id === structureId);
    
  //   if (option) {
  //     setSelectedStructure({ type, option });
  //     createStructurePreview({ type, option });
  //   }
  // };


  // Function to select a random structure from a category
const getStructure = (structureId:string, category: string) => {
  const structures = structuresByCategory[category as keyof typeof structuresByCategory];
  if (!structures || structures.length === 0) {
    console.error(`No structures found for category: ${category}`);
    return null;
  }
  return structures.find(structure => structure.id === structureId);
};

const calculateVerticalOffset = (mesh: BABYLON.Mesh): number => {
  const boundingBox = mesh.getBoundingInfo().boundingBox;
  return (boundingBox.maximum.y - boundingBox.minimum.y) * mesh.scaling.y / 2;
};

const createStructurePreview = async (structure: SelectedStructure) => {
  if (sceneRef.current && structurePreview) {
    structurePreview.dispose();
  }
  if (sceneRef.current) {
    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", structure.modelFile, sceneRef.current);
      const preview = result.meshes[0] as BABYLON.Mesh;
      preview.name = "structurePreview";

      // Set initial scaling
      const subCellSize = CELL_SIZE / SUB_GRID_SIZE;
      preview.scaling = new BABYLON.Vector3(
        STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
        structure.type === 'building' ? STRUCTURE_SCALE * 2 * (subCellSize / CELL_SIZE) : STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
        STRUCTURE_SCALE * (subCellSize / CELL_SIZE)
      );

      const verticalOffset = calculateVerticalOffset(preview);

      // Apply semi-transparent material
      const material = new BABYLON.StandardMaterial("previewMaterial", sceneRef.current);
      material.diffuseColor = getStructureColor(structure.id);
      material.alpha = 0.5;
      preview.material = material;

      preview.isVisible = false;
      preview.metadata = { verticalOffset }; 
      setStructurePreview(preview);
    } catch (error) {
      console.error(`Error loading model for ${structure.id}:`, error);
    }
  }
};

  // const handleCellClick = (x: number, z: number) => {
  //   if (selectedStructure) {
  //     console.log("placed")
  //     placeStructure(x, z);
  //   } else {
  //     zoomToCell(x, z);
  //     //addLog(`Inspecting cell (${x}, ${z})`);
  //     console.log(selectedStructure)
  //     console.log("placed")
  //   }
  // };

  const placeStructure = async (position: BABYLON.Vector3) => {
    if (!selectedStructure || !sceneRef.current) return;
    
    const cellX = Math.floor(position.x / CELL_SIZE);
    const cellZ = Math.floor(position.z / CELL_SIZE);
    const key = `${cellX}_${cellZ}`;
    const cell = gridCellsRef.current[key];
    
    if (cell.acquired) {
      const cellLocalX = position.x % CELL_SIZE;
      const cellLocalZ = position.z % CELL_SIZE;
  
      const snapX = Math.round(cellLocalX / (CELL_SIZE / SUB_GRID_SIZE)) * (CELL_SIZE / SUB_GRID_SIZE);
      const snapZ = Math.round(cellLocalZ / (CELL_SIZE / SUB_GRID_SIZE)) * (CELL_SIZE / SUB_GRID_SIZE);
  
      const subCellSize = CELL_SIZE / SUB_GRID_SIZE;
  
      try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", selectedStructure.modelFile, sceneRef.current);
        const newStructure = result.meshes[0] as BABYLON.Mesh;
        newStructure.name = `${selectedStructure.id}_${cellX}_${cellZ}`;
  
        newStructure.scaling = new BABYLON.Vector3(
          STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
          selectedStructure.type === 'building' ? STRUCTURE_SCALE * 2 * (subCellSize / CELL_SIZE) : STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
          STRUCTURE_SCALE * (subCellSize / CELL_SIZE)
        );

        const verticalOffset = calculateVerticalOffset(newStructure);
  
        newStructure.position = new BABYLON.Vector3(
          cellX * CELL_SIZE + snapX,
          verticalOffset + 0.2,
          cellZ * CELL_SIZE + snapZ
        );
        
        const material = new BABYLON.StandardMaterial(`structureMat_${cellX}_${cellZ}`, sceneRef.current);
        material.diffuseColor = getStructureColor(selectedStructure.id);
        newStructure.material = material;
  
        cell.structures.push({
          type: selectedStructure.type,
          category: selectedStructure.category,
          id: selectedStructure.id,
          mesh: newStructure,
          x: newStructure.position.x,
          y: newStructure.position.y,
          z: newStructure.position.z
        });
  
        console.log(`Placed ${selectedStructure.name} at cell (${cellX}, ${cellZ}), sub-position (${snapX.toFixed(2)}, ${snapZ.toFixed(2)})`);
      } catch (error) {
        console.error(`Error placing structure ${selectedStructure.id}:`, error);
      }
    } else {
      console.log(`Cannot build on unacquired land at (${cellX}, ${cellZ})`);
    }
  };

  useEffect(() => {
    if (sceneRef.current && structurePreview) {
      sceneRef.current.onPointerMove = (event) => {
        const pickResult = sceneRef.current?.pick(event.clientX, event.clientY);
        if (pickResult?.hit && pickResult.pickedMesh?.name.startsWith('cell_')) {
          const worldPosition = pickResult.pickedPoint;
          if (worldPosition) {
            const cellX = Math.floor(worldPosition.x / CELL_SIZE);
            const cellZ = Math.floor(worldPosition.z / CELL_SIZE);
            const cellLocalX = worldPosition.x % CELL_SIZE;
            const cellLocalZ = worldPosition.z % CELL_SIZE;

            // Snap to the nearest point on the sub-grid
            const snapX = Math.round(cellLocalX / (CELL_SIZE / SUB_GRID_SIZE)) * (CELL_SIZE / SUB_GRID_SIZE);
            const snapZ = Math.round(cellLocalZ / (CELL_SIZE / SUB_GRID_SIZE)) * (CELL_SIZE / SUB_GRID_SIZE);

            const subCellSize = CELL_SIZE / SUB_GRID_SIZE;
            structurePreview.position = new BABYLON.Vector3(
              cellX * CELL_SIZE + snapX,
              (structurePreview.metadata?.verticalOffset || 0) + PREVIEW_HEIGHT_OFFSET,
              cellZ * CELL_SIZE + snapZ
            );
            structurePreview.scaling = new BABYLON.Vector3(
              STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
              selectedStructure?.type === 'building' ? STRUCTURE_SCALE * 2 * (subCellSize / CELL_SIZE) : STRUCTURE_SCALE * (subCellSize / CELL_SIZE),
              STRUCTURE_SCALE * (subCellSize / CELL_SIZE)
            );
            structurePreview.isVisible = true;
          }
        } else {
          structurePreview.isVisible = false;
        }
      };

      sceneRef.current.onPointerDown = (event) => {
        if (event.button === 0) { // Left mouse button
          const pickResult = sceneRef.current?.pick(event.clientX, event.clientY);
          if (pickResult?.hit && pickResult.pickedMesh?.name.startsWith('cell_') && pickResult.pickedPoint) {
            placeStructure(pickResult.pickedPoint);
          }
        }
      };
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.onPointerMove = undefined;
        sceneRef.current.onPointerDown = undefined;
      }
    };
  }, [structurePreview, selectedStructure]);

  const createGUI = (scene: BABYLON.Scene) => {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Create top panel for info display
    createTopPanel(advancedTexture);

    // Create left panel for main menu
    createMainMenuPanel(advancedTexture);

    // Create right panel for sub-menus
    createSubMenuPanel(advancedTexture);

    createBottomLeftPanel(advancedTexture)
  };

  const createTopPanel = (advancedTexture: GUI.AdvancedDynamicTexture) => {
    const topPanel = new GUI.StackPanel();
    topPanel.width = "100%";
    topPanel.height = "50px";
    topPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    topPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    topPanel.background = "rgba(0, 100, 0, 0.2)";
    advancedTexture.addControl(topPanel);

    const infoText = new GUI.TextBlock();
    infoText.height = "30px";
    infoText.color = "black";
    topPanel.addControl(infoText);

    // Update the info text
    const updateInfoText = () => {
      infoText.text = `Balance: $${topPanelInfo.balance.toLocaleString()} | Wallet: ${topPanelInfo.walletAddress}`;
    };

    updateInfoText();

    // Update the info every second (you can adjust this as needed)
    setInterval(() => {
      setTopPanelInfo(prev => ({...prev, balance: prev.balance + 100}));
      updateInfoText();
    }, 1000);
  };

  const createBottomLeftPanel = (advancedTexture: GUI.AdvancedDynamicTexture) => {
    const topPanel = new GUI.StackPanel();
    topPanel.width = "400px";
    topPanel.height = "200px";
    topPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    topPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    topPanel.background = "rgba(0, 100, 0, 0.2)";
    

    advancedTexture.addControl(topPanel);

    const infoText = new GUI.TextBlock();
    infoText.height = "30px";
    infoText.color = "black";
    topPanel.addControl(infoText);

    // Update the info text
    const updateLogText = () => {
      infoText.text = `Balance: $${topPanelInfo.balance.toLocaleString()} | Wallet: ${topPanelInfo.walletAddress}`;
    };

    updateLogText();

    // Update the info every second (you can adjust this as needed)
    setInterval(() => {
      setTopPanelInfo(prev => ({...prev, balance: prev.balance + 100}));
      updateLogText();
    }, 1000);
  };


  const createMainMenuPanel = (advancedTexture: GUI.AdvancedDynamicTexture) => {
    const menuPanel = new GUI.StackPanel();
    menuPanel.width = "200px";
    menuPanel.height = "100%";
    menuPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    menuPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    menuPanel.top = "50px"; // Position below the top panel
    menuPanel.background = "white";
    advancedTexture.addControl(menuPanel);

    const menuItems = [
      { label: "Acquire Land", icon: "🏞️" },
      { label: "Buildings", icon: "🏢" },
      { label: "Infrastructure", icon: "🚧" },
    ];

    menuItems.forEach(item => {
      const button = GUI.Button.CreateSimpleButton(item.label, `${item.icon} ${item.label}`);
      button.width = "180px";
      button.height = "40px";
      button.color = "black";
      button.background = "lightgray";
      button.onPointerUpObservable.add(() => handleMenuItemClick(item.label));
      menuPanel.addControl(button);
    });
  };

  const createSubMenuPanel = (advancedTexture: GUI.AdvancedDynamicTexture) => {
    const subPanel = new GUI.StackPanel();
    subPanel.width = "300px";
    subPanel.height = "100%";
    subPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    subPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    subPanel.left = "200px";
    subPanel.top = "50px"; // Position below the top panel
    subPanel.background = "grey";
    subPanel.isVisible = false;
    advancedTexture.addControl(subPanel);

    const headerPanel = new GUI.StackPanel();
    headerPanel.isVertical = false;
    headerPanel.height = "50px";
    headerPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    subPanel.addControl(headerPanel);

    const titleText = new GUI.TextBlock();
    titleText.width = "200px";
    titleText.height = "40px";
    titleText.color = "black";
    headerPanel.addControl(titleText);

        // Cancel button with icon
    const cancelButton = GUI.Button.CreateImageWithCenterTextButton("cancelButton", CHAINVILLE_EMOJIS.CLOSE, "");
    cancelButton.width = "30px";
    cancelButton.height = "30px";
    cancelButton.color = "white";
    cancelButton.cornerRadius = 5
    cancelButton.thickness = 0;
  

    if (cancelButton.image) {
      cancelButton.image.width = "20px";
      cancelButton.image.height = "20px";
    }
    if (cancelButton.textBlock) {
      cancelButton.textBlock.fontSize = 14;
    }

    cancelButton.onPointerEnterObservable.add(() => {
      cancelButton.background = "red"; 
  });

    cancelButton.onPointerUpObservable.add(() => closePanel(subPanel, advancedTexture));
    headerPanel.addControl(cancelButton);


    const scrollViewer = new GUI.ScrollViewer();
    scrollViewer.width = 1;
    scrollViewer.height = "90%";
    subPanel.addControl(scrollViewer);

    const optionsList = new GUI.StackPanel();
    scrollViewer.addControl(optionsList);

    return { subPanel, titleText, optionsList };
  };


  const setupCameraControls = (scene: BABYLON.Scene) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;

    // Enable camera controls
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    // Adjust control sensitivities
    camera.panningSensibility = 50;  // Adjust panning speed
    camera.wheelPrecision = 50;      // Adjust zooming speed
    camera.angularSensibilityX = 250; // Adjust rotation speed
    camera.angularSensibilityY = 250;

    // Add keyboard controls for panning
    scene.onKeyboardObservable.add((kbInfo) => {
      let pan = 1; // Adjust this value to change pan speed
      switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case 'w':
            case 'W':
              camera.inertialPanningY += pan;
              break;
            case 's':
            case 'S':
              camera.inertialPanningY -= pan;
              break;
            case 'a':
            case 'A':
              camera.inertialPanningX -= pan;
              break;
            case 'd':
            case 'D':
              camera.inertialPanningX += pan;
              break;
          }
          break;
      }
    });

    // Right-click drag to rotate
    let isRightClickDown = false;
    scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          if (pointerInfo.event.button === 2) {
            isRightClickDown = true;
          }
          break;
        case BABYLON.PointerEventTypes.POINTERUP:
          if (pointerInfo.event.button === 2) {
            isRightClickDown = false;
          }
          break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
          if (isRightClickDown) {
            camera.inertialAlphaOffset -= pointerInfo.event.movementX * 0.01;
            camera.inertialBetaOffset -= pointerInfo.event.movementY * 0.01;
          }
          break;
      }
    });

    // Prevent context menu on right-click
    scene.getEngine().getRenderingCanvas()?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  };

  const zoomToCell = (x: number, z: number) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    camera.setTarget(new BABYLON.Vector3(
      (x + 0.5) * CELL_SIZE,
      0,
      (z + 0.5) * CELL_SIZE
    ));
    camera.radius = 30; // Zoom level when focusing on a cell
  }
  const handleMenuItemClick = (label: string) => {
    setActiveMenuSection(label);
    setShowLandPanel(label === "Acquire Land");
    setShowBuildingPanel(label === "Buildings");
    setShowInfrastructurePanel(label === "Infrastructure");
  };

  const acquireLand = (x: number, z: number) => {
    const key = `${x}_${z}`;
    if (!gridCellsRef.current[key].acquired) {
      gridCellsRef.current[key].acquired = true;
      (gridCellsRef.current[key].mesh.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(0.7, 0.7, 1);
      console.log(`Acquired land at ${x}, ${z}`);
      zoomToCell(x, z);
      updateAvailableLand();
    }
  };


  

  const updateAvailableLand = () => {
    const available: LandCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (!gridCellsRef.current[`${x}_${z}`].acquired) {
          available.push({ id: x * GRID_SIZE + z, x, z, acquired: false });
        }
      }
    }
    setAvailableLand(available);
  };

  const hidePanel = (subPanelConfig: GUI.StackPanel) =>{
    subPanelConfig.isVisible = false
  }

// // Updated handleBuildingAction function
// const handleBuildingAction = (buildingType: string) => {
//   const randomStructure = selectRandomStructure(buildingType);
//   if (randomStructure) {
//     const newSelectedStructure: SelectedStructure = {
//       type: 'building',
//       id: randomStructure.id,
//       name: randomStructure.name,
//       modelFile: randomStructure.modelFile,
//       cost: randomStructure.cost,
//       category: buildingType
//     };
//     setSelectedStructure(newSelectedStructure);
//     createStructurePreview(newSelectedStructure);
//   }
// };

// Updated handleInfrastructureAction function
// const handleInfrastructureAction = (infrastructureType: string) => {
//   const randomStructure = selectRandomStructure(infrastructureType);
//   if (randomStructure) {
//     const newSelectedStructure: SelectedStructure = {
//       type: 'infrastructure',
//       id: randomStructure.id,
//       name: randomStructure.name,
//       modelFile: randomStructure.modelFile,
//       cost: randomStructure.cost,
//       category: infrastructureType
//     };
//     setSelectedStructure(newSelectedStructure);
//     createStructurePreview(newSelectedStructure);
//   }
// };


  useEffect(() => {
    if (!sceneRef.current) return;
  
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, sceneRef.current);
  
    const { subPanel, titleText, optionsList } = createSubMenuPanel(advancedTexture);

    subPanelConfig = subPanel;
  
    if (showLandPanel) {
      subPanel.isVisible = true;
      titleText.text = "Acquire Land";
      optionsList.clearControls();
      availableLand.forEach(land => {
        const button = GUI.Button.CreateSimpleButton(`land_${land.id}`, `🏞️ Plot (${land.x}, ${land.z})`);
        button.width = "280px";
        button.height = "30px";
        button.color = "black";
        button.background = "lightgreen";
        button.thickness = 0;
        button.onPointerUpObservable.add(() => acquireLand(land.x, land.z));
        optionsList.addControl(button);
      });
    } else if (showBuildingPanel) {
      subPanel.isVisible = true;
      titleText.text = "Buildings";
      optionsList.clearControls();
      buildingOptions.forEach(option => {
        const button = GUI.Button.CreateSimpleButton(option.id, `${option.icon} ${option.name}`);
        button.width = "280px";
        button.height = "30px";
        button.color = "black";
        button.background = "lightblue";
        button.thickness = 0;
        // button.onPointerUpObservable.add(() => handleBuildingAction(option.id));
        button.onPointerUpObservable.add(() => showStructureOptions(option.id,advancedTexture,'building' ));
        optionsList.addControl(button);
      });
    } else if (showInfrastructurePanel) {
      subPanel.isVisible = true;
      titleText.text = "Infrastructure";
      optionsList.clearControls();
      infrastructureOptions.forEach(option => {
        const button = GUI.Button.CreateSimpleButton(option.id, `${option.icon} ${option.name}`);
        button.width = "280px";
        button.height = "30px";
        button.color = "black";
        button.background = "lightyellow";
        button.thickness = 0;
        button.onPointerUpObservable.add(() => showStructureOptions(option.id,advancedTexture,'infrastructure' ));
        optionsList.addControl(button);
      });
    } else {
      subPanel.isVisible = false;
    }
  
  }, [showLandPanel, showBuildingPanel, showInfrastructurePanel, availableLand, buildingOptions, infrastructureOptions]);

  const showStructureOptions = (category: string,advancedTexture: GUI.AdvancedDynamicTexture,buildingType: string) => {
    
    const structures = structuresByCategory[category as keyof typeof structuresByCategory];
    
    const optionsPanel = new GUI.StackPanel("structureOptionsPanel");
    optionsPanel.width = "300px";
    optionsPanel.background = "white";
    optionsPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    optionsPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    optionsPanel.left = "200px";
    optionsPanel.paddingTop = "50px";
    optionsPanel.paddingBottom = "10px";

    const headerPanel = new GUI.StackPanel();
    headerPanel.isVertical = false;
    headerPanel.height = "50px";
    headerPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    optionsPanel.addControl(headerPanel);
    
    const titleText = new GUI.TextBlock();
    titleText.text = `${category.charAt(0).toUpperCase() + category.slice(1)} Structures`;
    titleText.width = "200px";
    titleText.height = "30px";
    titleText.color = getCategoryColor(category);
    headerPanel.addControl(titleText);

        // Cancel button with icon
    const cancelButton = GUI.Button.CreateImageWithCenterTextButton("cancelButton", CHAINVILLE_EMOJIS.CLOSE, "");
    cancelButton.width = "30px";
    cancelButton.height = "30px";
    cancelButton.color = "white";
    cancelButton.cornerRadius = 5
    cancelButton.thickness = 0;
  

    if (cancelButton.image) {
      cancelButton.image.width = "20px";
      cancelButton.image.height = "20px";
    }
    if (cancelButton.textBlock) {
      cancelButton.textBlock.fontSize = 14;
    }

    cancelButton.onPointerEnterObservable.add(() => {
      cancelButton.background = "red"; 
  });

    cancelButton.onPointerUpObservable.add(() => closePanel(optionsPanel, advancedTexture));
    headerPanel.addControl(cancelButton);

  
    structures.forEach(structure => {
      const button = GUI.Button.CreateSimpleButton(structure.id, structure.name);
      button.width = "280px";
      button.height = "30px";
      button.color = "black";
      button.cornerRadius = 5;
      button.thickness = 0;
      button.background = getCategoryColor(category);
      button.onPointerUpObservable.add(() => showStructureDetails(structure, category, advancedTexture,buildingType));
      optionsPanel.addControl(button);
    });
  
    // Add the options panel to your main UI
    advancedTexture.addControl(optionsPanel);
  };

  const showStructureDetails = (structure: any, category: string,advancedTexture: GUI.AdvancedDynamicTexture,buildingType: string) => {
    const detailsPanel = new GUI.StackPanel("structureDetailsPanel");
    detailsPanel.width = "300px";
    detailsPanel.background = "white";
    detailsPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    detailsPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    detailsPanel.left = "200px";
    detailsPanel.paddingTop = "50px";
    detailsPanel.paddingBottom = "10px";
    
    
    const titleText = new GUI.TextBlock();
    titleText.text = structure.name;
    titleText.height = "30px";
    titleText.color = "black";
    detailsPanel.addControl(titleText);
  
    if (structure.thumbnail) {
      const thumbnail = new GUI.Image("thumbnail", structure.thumbnail);
      thumbnail.width = "200px";
      thumbnail.height = "150px";
      detailsPanel.addControl(thumbnail);
    }
  
  // Create a horizontal stack panel for buttons
  const buttonPanel = new GUI.StackPanel();
  buttonPanel.isVertical = false;
  buttonPanel.height = "50px";
  buttonPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  detailsPanel.addControl(buttonPanel);

  // Confirm button with icon
  const confirmButton = GUI.Button.CreateImageWithCenterTextButton("confirmButton", CHAINVILLE_EMOJIS.CONFIRM, "");
  confirmButton.width = "40px";
  confirmButton.height = "40px";
  confirmButton.color = "white";
  confirmButton.thickness = 0;
  confirmButton.background = "green";
  confirmButton.cornerRadiusW = 5;
  confirmButton.cornerRadiusX = 5;

  if (confirmButton.image) {
    confirmButton.image.width = "20px";
    confirmButton.image.height = "20px";
  }
  if (confirmButton.textBlock) {
    confirmButton.textBlock.fontSize = 14;
  }

  confirmButton.onPointerEnterObservable.add(() => {
    document.body.style.cursor = 'pointer';
  });

  confirmButton.onPointerUpObservable.add(() => {
    
    handleStructureAction(structure.id, category,buildingType);
    closePanel(detailsPanel, advancedTexture);
  });
  buttonPanel.addControl(confirmButton);

  // Cancel button with icon
  const cancelButton = GUI.Button.CreateImageWithCenterTextButton("cancelButton", CHAINVILLE_EMOJIS.CLOSE, "");
  cancelButton.width = "40px";
  cancelButton.height = "40px";
  cancelButton.color = "white";
  cancelButton.thickness = 0;
  cancelButton.background = "red";
  cancelButton.cornerRadiusY = 5;
  cancelButton.cornerRadiusZ = 5;

  if (cancelButton.image) {
    cancelButton.image.width = "20px";
    cancelButton.image.height = "20px";
  }
  if (cancelButton.textBlock) {
    cancelButton.textBlock.fontSize = 14;
  }

  cancelButton.onPointerUpObservable.add(() => closePanel(detailsPanel, advancedTexture));
  buttonPanel.addControl(cancelButton);

  // Add some space between buttons
  const spacer = new GUI.Rectangle();
  spacer.width = "20px";
  spacer.thickness = 0;
  buttonPanel.addControl(spacer);
  
    // Add the details panel to your main UI
    advancedTexture.addControl(detailsPanel);
  };

  const handleStructureAction = (structureId: any, category: string, buildingType: string) => {
    // Implement your logic for handling the structure action
    console.log(`Building ${structureId} from category ${category}`);
    // You might want to call a function from your game logic here
    const structure = getStructure(structureId,category);
    if (structure) {
      const newSelectedStructure: SelectedStructure = {
        type: buildingType,
        id: structure.id,
        name: structure.name,
        modelFile: structure.modelFile,
        cost: structure.cost,
        category: category
      };
      setSelectedStructure(newSelectedStructure);
      createStructurePreview(newSelectedStructure);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      residential: 'lightblue',
      office: 'lightgreen',
      industry: 'lightyellow',
      hospital: 'lightpink',
      roads: 'lightgray',
      waterSupply: 'lightcyan',
      powerLines: 'lightsalmon'
    };
    return colors[category as keyof typeof colors] || 'white';
  };

  const closePanel = (panel: GUI.StackPanel, advancedTexture: GUI.AdvancedDynamicTexture) => {
    advancedTexture.removeControl(panel);
  };


  
  // Initial update of available land
  useEffect(() => {
    updateAvailableLand();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameWorkspace;
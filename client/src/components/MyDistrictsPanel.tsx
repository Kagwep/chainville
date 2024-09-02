import * as GUI from '@babylonjs/gui';
import { District } from '../utils/types';
import { normalizeAddress } from '../utils/subsquidInteract';

const MyDistrictsPanel = (
advancedTexture: GUI.AdvancedDynamicTexture, districtMap: Map<string, District> | null, onUpdateDistrict: (districtKey: string) => void, onSellDistrict: (districtKey: string) => void, onRollbackDistrict: (districtKey: string) => void, onGoTo: (x: number,y: number) => void) => {
    const containerPanel = new GUI.Rectangle("myDistrictsContainer");
    containerPanel.width = "400px";
    containerPanel.height = "600px";
    containerPanel.cornerRadius = 10;
    containerPanel.color = "White";
    containerPanel.thickness = 2;
    containerPanel.background = "rgba(0, 0, 0, 0.7)";
    containerPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    containerPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(containerPanel);

    const titleText = new GUI.TextBlock("titleText");
    titleText.text = "My Districts";
    titleText.color = "white";
    titleText.fontSize = 24;
    titleText.height = "40px";
    titleText.top = "10px";
    containerPanel.addControl(titleText);

    const closeContainerButton = GUI.Button.CreateSimpleButton("closeContainerButton", "❌");
    closeContainerButton.width = "30px";
    closeContainerButton.height = "30px";
    closeContainerButton.color = "white";
    closeContainerButton.cornerRadius = 15;
    closeContainerButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    closeContainerButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    closeContainerButton.onPointerClickObservable.add(() => {
        containerPanel.isVisible = false;
    });
    containerPanel.addControl(closeContainerButton);

    const scrollViewer = new GUI.ScrollViewer("districtScroller");
    scrollViewer.width = "380px";
    scrollViewer.height = "530px";
    scrollViewer.top = "60px";
    scrollViewer.thickness = 0;
    containerPanel.addControl(scrollViewer);

    const districtList = new GUI.StackPanel("districtList");
    districtList.width = "100%";
    scrollViewer.addControl(districtList);

    const createDistrictCard = (district: District) => {
        const cardPanel = new GUI.Rectangle(`card_${district.id}`);
        cardPanel.width = "360px";
        cardPanel.height = "500px";
        cardPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        cardPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
       // cardPanel.left = "-200px";
        cardPanel.color = "white";
        cardPanel.thickness = 1;
        cardPanel.background = "rgb(50, 50, 50)";
        cardPanel.cornerRadius = 5;
        cardPanel.isVisible = false;

        const nameText = new GUI.TextBlock(`name_${district.id}`);
        nameText.text = district.districtName;
        nameText.color = "white";
        nameText.fontSize = 18;
        nameText.height = "30px";
        cardPanel.addControl(nameText);

        const infoText = new GUI.TextBlock(`info_${district.id}`);
        infoText.text = `ID: ${district.id}\nOwner: ${normalizeAddress(district.owner)}\nCoordinates: (${district.x}, ${district.y})\nLast Update: ${new Date(district.lastUpdate as any *1000)}`;
        infoText.color = "white";
        infoText.fontSize = 14;
        infoText.height = "150px";
        infoText.top = "-30px";
        infoText.textWrapping = true;
        cardPanel.addControl(infoText);

        const createActionButton = (name: string, label: string, emoji: string, top: string, background: string, onClick: () => void) => {
            const button = GUI.Button.CreateSimpleButton(name, `${emoji} ${label}`);
            button.width = "110px";
            button.height = "35px";
            button.color = "white";
            button.cornerRadius = 5;
            button.background = background;
            button.top = top;
            button.onPointerClickObservable.add(onClick);
            return button;
        };

        const updateButton = createActionButton(`update_${district.id}`, "Update", "🔄", "60px", "#4CAF50", 
            () => onUpdateDistrict(`${district.x}_${district.y}`));
        updateButton.left = "-115px";
        cardPanel.addControl(updateButton);

        const sellButton = createActionButton(`sell_${district.id}`, "Sell", "💰", "60px", "#FFA500", 
            () => onSellDistrict(`${district.x}_${district.y}`));
        cardPanel.addControl(sellButton);

        const rollbackButton = createActionButton(`rollback_${district.id}`, "Roll Back", "⏪", "60px", "#2196F3", 
            () => onRollbackDistrict(`${district.x}_${district.y}`));
        rollbackButton.left = "115px";
        cardPanel.addControl(rollbackButton);

        const onGoToButton = createActionButton(`onGoTo_${district.id}`, "Go to", "📍", "60px", "#2196F3", 
            () => onGoTo(district.x,district.y));
        rollbackButton.left = "115px";
        cardPanel.addControl(onGoToButton);

        const closeCardButton = GUI.Button.CreateSimpleButton(`close_${district.id}`, "❌");
        closeCardButton.width = "25px";
        closeCardButton.height = "25px";
        closeCardButton.color = "white";
        closeCardButton.cornerRadius = 12.5;
        closeCardButton.background = "red";
        closeCardButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        closeCardButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        closeCardButton.top = "5px";
        closeCardButton.left = "-5px";
        closeCardButton.onPointerClickObservable.add(() => {
            cardPanel.isVisible = false;
        });
        cardPanel.addControl(closeCardButton);

        return cardPanel;
    };

    districtMap?.forEach((district, key) => {
        const districtButton = GUI.Button.CreateSimpleButton(key, `🏙️ ${district.districtName} (${district.x}, ${district.y})`);
        districtButton.width = "360px";
        districtButton.height = "40px";
        districtButton.color = "white";
        districtButton.cornerRadius = 5;
        districtButton.background = "rgba(100, 100, 100, 0.5)";
        districtList.addControl(districtButton);

        const districtCard = createDistrictCard(district);
        districtList.addControl(districtCard);

        districtButton.onPointerClickObservable.add(() => {
            districtCard.isVisible = !districtCard.isVisible;
        });

        const spacer = new GUI.Rectangle("spacer");
        spacer.height = "5px";
        spacer.thickness = 0;
        districtList.addControl(spacer);
    });

    return containerPanel;
};

export default MyDistrictsPanel;
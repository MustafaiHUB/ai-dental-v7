'use strict';

class Products {
    // Selectors
    modelTitle = document.querySelector('.model-title');
    uploadedImageContainer = document.querySelector('.uploaded-image');
    choosingModels = document.querySelector('.choosing-models');
    models = document.querySelectorAll('.model');
    selectedImage = document.querySelector('.selected-image');
    diseasesList = document.querySelector('.list-diseases');
    allDiseasesInput = document.getElementById('all');
    diseasesMenuList = document.querySelector('.body');
    places = document.querySelectorAll('.place');
    checkboxInput = document.querySelectorAll('input[type="checkbox"]');
    currentImage = document.querySelector('.current-img');
    uploadInput = document.getElementById('upload-input');

    constructor() {
        this.choosingModels.addEventListener('click', this._models.bind(this));
        this.uploadInput.addEventListener('change', this._changeInput.bind(this));
    }

    _models(e) {
        const btn = e.target.closest('.model');
        // guard if     
        if (!btn) return;
        const modelNum = btn.dataset.modelNum;
        this.modelTitle.textContent = `Model ${modelNum}`;

        // Removing the active class from the previous models
        this.models.forEach(model => {
            model.classList.remove('active');
        })
        btn.classList.add('active');
    }
    _generateDiseasePlace = function (color = '', diseaseName, topCoords, leftCoords, score, width, height) {
        const html = `
        <div score="${score}%" disease-name="${diseaseName}" class="place ${color}" style="top: ${topCoords}%; left: ${leftCoords}%; width: ${width}%; height: ${height}%"></div>
        `;
        this.choosingModels.insertAdjacentHTML('beforeend', html);
    }
    _changeInput(e) {
        this.clearInput();
        e.preventDefault();

        const imagesName = e.target.files[0];

        // Display loading while fetching data
        const loadingHTML = `
        <section class="dots-container">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </section>
        `;
        // const loadingHTML = `
        // <div class="waiting-data">
        //     <span></span>
        //     <span></span>
        //     <span></span>
        // </div>
        // `;
        this.choosingModels.insertAdjacentHTML('beforeend', loadingHTML);

        this.currentImage.src = URL.createObjectURL(imagesName);
        this.JSONcall1(imagesName);
    }
    _setTimeOut(sec) {
        return new Promise(function (_, reject) {
            setTimeout(() => {
                reject(new Error('Process took to long, please try again!'));
            }, sec * 1000)
        });
    }
    async JSONcall1(imagesName) {
        const formData = new FormData();
        formData.append("image", imagesName)
        try {

            // response will take the fastest response between the fetching and 2 and half minutes
            const res = await Promise.race([fetch('https://lobster-app-r8jem.ondigitalocean.app/upload/', {
                method: 'POST',
                body: formData,
            }), this._setTimeOut(150)]);
            if (!res.ok) {
                this.clearInput();
                const noDiseaseHTML = `
                    <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
                `;
                this.choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
            }

            else {
                const data = await res.json();
                this.JSONcall2(imagesName);
            }
        } catch (err) {
            this.clearInput();
            const noDiseaseHTML = `
                    <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
                `;
            this.choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
        }

    }
    async JSONcall2(imagesName) {
        try {
            const res = await Promise.race([fetch('https://lobster-app-r8jem.ondigitalocean.app/v8/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "filename": imagesName.name
                }),
            }), this._setTimeOut(150)]);
            if (!res.ok) {
                this.clearInput();
                const noDiseaseHTML = `
                    <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
                `;
                this.choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
            }

            else {
                const data = await res.json();
                const numberOfDiseases = data.length;

                // Display no disease was found if the lenght = 0
                if (!numberOfDiseases) {
                    // Display the image
                    this.clearInput();
                    const imageHTML = `
                    <img
                    class="selected-image"
                    src="${URL.createObjectURL(imagesName)}"
                    alt="Tooth Vision"
                />
                `;
                    this.choosingModels.insertAdjacentHTML('beforeend', imageHTML);
                }

                else {
                    // Display the image
                    this.clearInput();
                    const imageHTML = `
                    <img
                    class="selected-image"
                    src="${URL.createObjectURL(imagesName)}"
                    alt="Tooth Vision"
                />
                `;
                    this.choosingModels.insertAdjacentHTML('beforeend', imageHTML);
                    for (const i of data) {
                        const { box } = i;
                        const type = i.cls - 1;
                        const { score } = i;
                        const diseaseColorInput = this.checkboxInput[type].dataset.color;
                        const nameOfDisease = this.checkboxInput[type].dataset.diseaseName;
                        this.checkboxInput[type].checkVisibility = true;
                        this._generateDiseasePlace(diseaseColorInput, nameOfDisease, box[0] * 100, box[1] * 100, (score * 100).toFixed(1), (box[3] - box[1]) * 100, (box[2] - box[0]) * 100);
                    }
                }
            }
        } catch (err) {
            this.clearInput();
            const noDiseaseHTML = `
                    <h2 class="image-error">Error happened while sending the image ... Please try again!</h2>
                `;
            this.choosingModels.insertAdjacentHTML('beforeend', noDiseaseHTML);
        }
    }
    clearInput() {
        this.choosingModels.innerHTML = '';
    }
}
const products = new Products();
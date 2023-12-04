/**
 *
 * @param {*} gwtRow - построчно каждая заявка
 */
function isEmpty(gwtRow){
    waitForEl(`[__gwt_row="${gwtRow}"]`, ()=>{
        console.log(gwtRow);
        var tableList = $(`[__gwt_row="${gwtRow}"] > td:nth-child(4) > a > div`)[0].innerText;
        console.log(tableList);
        var link = $(`[__gwt_row="${gwtRow}"] > td:nth-child(4) > a`)[0].href;
        gwtRow++;
        openTabs(link, gwtRow);
    })
}


/**
 *
 * @param {*} url - ссылка на заявку
 * @param {*} nextGwtRow - ссылка на следщую строку заявки
 */
function openTabs(url, nextGwtRow) {
    window.location.href = `${url}`;
    waitForEl('#gwt-debug-userName-value', ()=>{
        grabData();
        history.back();
        isEmpty(nextGwtRow);
    })
}


/**
 * Функция парсинга
 */
async function grabData(){
    // const uniqId = generateUniqueId()
    const uniqId = $('#gwt-debug-objectUuid')[0].innerText;
    var name = $('#gwt-debug-userName-value > a')[0].innerText;
    var division = $('#gwt-debug-hierarchyUnits-value > div')[0].innerText;
    var contactNumber = $('#gwt-debug-userPhone-value')[0].innerText;
    var contactEmail = $('#gwt-debug-userEmail-value')[0].innerText;
    var responsible = $('#gwt-debug-responsible-value > a:nth-child(1)')[0].innerText;
    var srcText = $('#gwt-debug-descriptionInRTF-value > iframe').attr('src');

    waitForEl(`.GIEYS3IOV`, ()=>{
        var comment = $(`.GIEYS3IOV`)[0];
        // console.log(comment);
        grabComments(comment)
    })
    // var comment = await grabComments();

    waitForEl('#gwt-debug-ContentFiles-value', () => {
        var links = document.querySelectorAll('#gwt-debug-ContentFiles-value > a');

        links.forEach((linkElement, index) => {
            var link = linkElement.getAttribute('href');
            link && downloadFiles(link, `${uniqId}_${index}`);
        });
    });

    var text = await fetchText(srcText, uniqId);

    console.log(name, division, contactNumber, contactEmail, responsible, text);
    store = {
        name:name,
        division:division,
        contactNumber:contactNumber,
        contactEmail:contactEmail,
        responsible:responsible,
        text:text
    }

    saveToLocalStorage(uniqId, store);
}


/**
 *
 * @param {*} url - ссылка на текст "Подробнее" из заявки
 * @returns текст
 */
async function fetchText(url, uniqId){
    try {
        console.log(`https://10.77.71.130/sd/operator/${url}`)
        const response = await fetch(`https://10.77.71.130/sd/operator/${url}`);
        if (response.ok) {
            const htmlString = await response.text();
            var tempElement = document.createElement('div');
            tempElement.innerHTML = htmlString;
            var divElements = tempElement.querySelectorAll('div');
            var extractedText = Array.from(divElements).map(element => element.textContent);
            var mergedText = extractedText.join(' ');
            try{
                const imgTags = tempElement.querySelectorAll('img');

                imgTags.forEach((img, index) => {
                    const srcImg = img.getAttribute('src');
                    console.log(srcImg);
                    srcImg && downloadFiles(srcImg, `text_${uniqId}_${index}`);
                });
            }
            catch(err){
                console.log(err);
            }
            return mergedText;
        } else {
            throw new Error('Неверный Fetch-запрос');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


/**
 *
 * @param {*} url - ссылка на загрузку файлов
 * @param {*} uuid - уникальный ID
 */
async function downloadFiles(url, uuid) {
    try {
        var link = url.slice(2);
        console.log(`https://10.77.71.130/sd/operator/${link}`)
        const response = await fetch(`https://10.77.71.130/sd/operator/${link}`);
        console.log(response.status);
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${uuid}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log('Файл загружен');
        } else {
            throw new Error('Ошибка при загрузке файла');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


/**
 *
 */
async function grabComments(comment){
    console.log(comment);
    // var idCom = 0;
    // waitForEl(`.GIEYS3IOV`, ()=>{
    //     var comment = $(`.GIEYS3IOV`)[0];
        // var comment = $(`[__idx="${idCom}"] > div > div > td:nth-child(2) > td:nth-child(2) > div > td:nth-child(6) > div > iframe`)[0];
        // return comment;
        // var link = $(`[__gwt_row="${gwtRow}"] > td:nth-child(4) > a`)[0].href;
        // gwtRow++;
        // openTabs(link, gwtRow);
    // })
}


/**
 *
 * @param {*} key - ключ уникальный id
 * @param {*} data - данные после парсинга
 */
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


const startingGwtRow = 0;
isEmpty(startingGwtRow);


/**
 *
 * @param {*} data
 * @param {*} filename
 */
function saveDataToJSON(data, filename) {
    let existingData = {};

    if (localStorage.getItem(filename)) {
        existingData = JSON.parse(localStorage.getItem(filename));
    }

    const newData = { ...existingData, ...data };

    localStorage.setItem(filename, JSON.stringify(newData));
}

const sampleData = { key: 'value', number: 123 };
saveDataToJSON(sampleData, 'sample_data.json');


/**
 *
 * @param {*} filename
 */
function downloadJSONFile(filename) {
    const jsonData = localStorage.getItem(filename);
    if (jsonData) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        link.click();
        URL.revokeObjectURL(url);
    } else {
        console.error('Файл не найден');
    }
}

// downloadJSONFile('sample_data.json');

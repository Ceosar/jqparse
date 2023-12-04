console.log("start");

var existingData = JSON.parse(localStorage.getItem("state")) || [];

document.addEventListener('DOMContentLoaded', function() {
    var startButton = document.getElementById('startBtn');

    startButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    parseTableRow(document.querySelector(".tableRow"));
                }
            });
        });
    });
});


async function parseTableRow(tableRowElement) {
    var dateStart = "";
    var sla = "";
    var id = "";
    var userName = "";
    var serviceName = "";
    var type = "";

    var $resizeCol1 = $(tableRowElement).find('.resize-column-86 .cellInsider div');

    if ($resizeCol1.length) {
        dateStart = $resizeCol1.text().trim();
        console.log(dateStart);
    }

    var $resizeCol2 = $(tableRowElement).find('.resize-column-89 .cellInsider div');

    if ($resizeCol2.length) {
        sla = $resizeCol2.text().trim();
        console.log(sla);
    }

    var $resizeCol3 = $(tableRowElement).find('.resize-column-90 .cellInsider div');

    if ($resizeCol3.length) {
        id = $resizeCol3.text().trim();
        console.log(id);
    }

    var $resizeCol4 = $(tableRowElement).find('.resize-column-93 .cellInsider div');

    if ($resizeCol4.length) {
        userName = $resizeCol4.text().trim();
        console.log(userName);
    }

    var $resizeCol5 = $(tableRowElement).find('.resize-column-94 .cellInsider div');

    if ($resizeCol5.length) {
        serviceName = $resizeCol5.text().trim();
        console.log(serviceName);
    }

    var $resizeCol6 = $(tableRowElement).find('.resize-column-99 .cellInsider div');

    if ($resizeCol6.length) {
        type = $resizeCol6.text().trim();
        console.log(type);
    }

    var $iframe = $(tableRowElement).find("iframe");

    if ($iframe.length) {
        var $divInsideIframe = $($iframe[0].contentDocument).find("div");

        if ($divInsideIframe.length) {
            var content = $divInsideIframe.text().trim();
            console.log("Содержимое <div> внутри iframe:", content);
        } else {
            console.log("Элемент <div> внутри iframe не найден");
        }
    }

    var $resizeCol7 = $(tableRowElement).find('.resize-column-90 .cellInsider');
    console.log($resizeCol7)
    if ($resizeCol7.length) {
        var link = $resizeCol7.attr('href');
        var $divElementIns = $resizeCol7.find('div');

        if ($divElementIns.length) {
            var iframeElementIns = $divElementIns.find('iframe');

            console.log(link)
            const numberLink = Number(link.match(/\d+/g));
            console.log(numberLink);
            const linker = `https://10.77.71.130/sd/operator/${link}`;
            console.log(linker);

            try {
                var htmlText = await fetchDataFromPage(linker);
                // var htmlText = await delayFetchFun(linker);
                // var htmlText = await waitForRedirectToComplete(linker);
                console.log(htmlText);
                if (htmlText) {
                    await Parserer(htmlText);
                }
            } catch (error) {
                console.log(error);
            } finally {
                console.log("end");
            }
        }
    }

    const obj = {
        dateStart: dateStart,
        sla: sla,
        id: id,
        userName: userName,
        serviceName: serviceName,
        type: type
    }

    existingData.push(obj);
}

// async function delayFetchFun(linker) {
//     // const controller = new AbortController();

//     // const timeoutId = setTimeout(() => {
//     //     controller.abort();
//     // }, 3000);

//     const options = {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'text/html;charset=UTF-8'
//         },
//     };

//     const response = await fetch(linker, options);

//     console.log(response)
//     clearTimeout(timeoutId);

//     if (!response.ok) {
//         throw new Error('Network response was not ok');
//     }

//     return await response.text();
// }

async function waitForRedirectToComplete(linker) {
    return new Promise(async (resolve, reject) => {
        const maxAttempts = 10;
        let attempts = 0;

        const checkForRedirect = async () => {
            if (attempts >= maxAttempts) {
                console.log('Превышено максимальное количество попыток');
                reject(new Error('Превышено максимальное количество попыток'));
                return;
            }

            const response = await fetch(linker);
            console.log(response);
            if (response.ok) {
                const finalUrl = response.url;
                if (finalUrl === linker) {
                    attempts++;
                    setTimeout(checkForRedirect, 10000);
                } else {
                    const responseData = response.url;
                    resolve(responseData);
                }
            } else {
                attempts++;
                setTimeout(checkForRedirect, 10000);
            }
        };

        checkForRedirect();
    });
}

async function fetchDataFromPage(link) {
    try {
        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(link, { signal: controller.signal });
        console.log(response)
        if (response.ok) {
            const responseData = await response.text();
            // const parsedData = parseDataFromPage(responseData
            console.log(responseData);
            return responseData;
        } else {
            console.error('GET-запрос не выполнен успешно');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function Parserer(htmlText) {
    console.log(htmlText);
    var $doc = $(htmlText);

    var $someElement = $doc.find('#gwt-debug-title-value');
    var $global = $doc.find('#globalWrapper');

    console.log($global);
    console.log($someElement);
}

(async () => {
    var $tableRowElements = $(".tableRow");

    for (let i = 0; i < $tableRowElements.length; i++) {
        await parseTableRow($tableRowElements[i]);
    }
})();

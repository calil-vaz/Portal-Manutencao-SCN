    const url = `https://opensheet.elk.sh/1sg-lgB8ZXpNXd_koZsj5sioi4agF5mc1bAt7Rmrk018/TAREFAS`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            processData(data);
            console.log(data);           
        })
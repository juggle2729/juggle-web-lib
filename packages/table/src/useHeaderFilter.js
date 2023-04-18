export default function (columns, changeHeadList) {
    const options = columns.map(item => ({
        label: item.label,
        value: item.label,
    }));
    return (
        <juggle-filter-tooltip
            options={options}
            onChange={changeHeadList}
        ></juggle-filter-tooltip>
    );
}
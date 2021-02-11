class LocalDatabase {
    static idCounter = 0

    static data = {}

    static generateId = () => this.idCounter++

    static postItem(data) {
        const id = this.generateId();
        this.data[id] = { ...data, id };
        return this.data[id];
    }

    static getItem = id => this.data[id]

    static updateItem(id, data) {
        this.data[id] = { ...this.data[id], ...data, id };
        return this.data[id];
    }
}

export default LocalDatabase;

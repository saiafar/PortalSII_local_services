const electron = require('electron');

class Boleta{

    constructor(id, folio, fecha){
        this.id = id;
        this.folio =folio;
        this.fechaEmision = this.formatFecha(fecha);
        this.total = 0;
        this.detalles = [];
    }

    formatFecha(fecha){
        let day = (fecha.getDate() < 10)?`0${fecha.getDate()}`:fecha.getDate();
        let month = fecha.getMonth()+1;
        month = (month < 10)?`0${month}`:month;
        fecha = `${fecha.getFullYear()}-${month}-${day}`;
        return fecha;
    }

    addDetalle(idProducto, nombreProducto, precio, cant){
        let totalDetalle = precio*cant;
        this.detalles.push({id:idProducto ,producto:nombreProducto, precio:precio, cantidad:cant, total:totalDetalle})
        this.total += totalDetalle;
    }

    getJson(){
        return {
            folio: this.folio,
            id: this.id,
            fecha: this.fechaEmision,
            total: this.total,
            detalles: this.detalles,
        }
    }
}

module.exports = Boleta;

/*
BEGIN TRANSACTION
ALTER TABLE [PuntoVenta].[dbo].[Documentos] 
ADD EnvioPortalWeb int NOT NULL 
CONSTRAINT D_Documentos_EnvioPortalWeb
DEFAULT (0)
COMMIT
GO
*/
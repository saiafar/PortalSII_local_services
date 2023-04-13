const electron = require('electron');

class Venta{

    constructor(id, folio, tipo, fecha, usuario, caja, monto){
        this.documentoID = id;
        this.folio =folio;
        this.tipo = tipo;
        this.fecha = this.formatFecha(fecha);
        this.hora = this.getHora(fecha);
        this.total = 0;
        this.monto = monto;
        this.usuario =  usuario;
        this.caja = caja;
        this.detalles = [];
    }

    formatFecha(fecha){
        let day = (fecha.getDate() < 10)?`0${fecha.getDate()}`:fecha.getDate();
        let month = fecha.getMonth()+1;
        month = (month < 10)?`0${month}`:month;
        fecha = `${fecha.getFullYear()}-${month}-${day}`;
        return fecha;
    }

    getHora(fecha){
        let hour = (fecha.getHours() < 10)?`0${fecha.getHours()}`:fecha.getHours();
        let min = (fecha.getMinutes() < 10)?`0${fecha.getMinutes()}`:fecha.getMinutes();
        hour = `${hour}:${min}`;
        return hour;
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

module.exports = Venta;

/*
BEGIN TRANSACTION
ALTER TABLE [PuntoVenta].[dbo].[Documentos] 
ADD EnvioPortalWeb int NOT NULL 
CONSTRAINT D_Documentos_EnvioPortalWeb
DEFAULT (0)
COMMIT
GO
*/
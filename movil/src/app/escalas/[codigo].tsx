import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Boton } from "@/componentes/boton";
import { Cabecera } from "@/componentes/cabecera";
import { Mensaje } from "@/componentes/mensaje";
import { Opcion } from "@/componentes/opcion";
import { Pie } from "@/componentes/pie";
import { Tarjeta } from "@/componentes/tarjeta";
import { Texto } from "@/componentes/texto";
import { EscalaRepositorio } from "@/datos/escala-repositorio";
import { Escala, type Opcion as OpcionEscala, type Respuestas } from "@/dominio/escala";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

export default function PantallaEscala() {
  // /escalas/news2 da codigo = "news2".
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const db = useSQLiteContext();

  const [escala, setEscala] = useState<Escala | null>(null);
  // Escala 1 o 2 de SpO2. null si la escala no tiene selector.
  const [variante, setVariante] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Respuestas>({});

  useEffect(() => {
    new EscalaRepositorio(db).porCodigo(codigo).then((leida) => {
      setEscala(leida);
      // Se empieza por la variante por defecto.
      setVariante(leida?.definicion.selector?.porDefecto ?? null);
    });
  }, [db, codigo]);

  function responder(itemId: string, opcion: OpcionEscala) {
    setRespuestas({ ...respuestas, [itemId]: opcion });
  }

  // Al cambiar la variante se borran las respuestas de la otra (R04F02T02).
  function cambiarVariante(nueva: string) {
    const conservadas: Respuestas = {};
    for (const [itemId, opcion] of Object.entries(respuestas)) {
      if (opcion.variante === null) {
        conservadas[itemId] = opcion;
      }
    }
    setVariante(nueva);
    setRespuestas(conservadas);
  }

  function reiniciar() {
    setRespuestas({});
    setVariante(escala?.definicion.selector?.porDefecto ?? null);
  }

  if (escala === null) {
    return <View style={styles.pantalla} />;
  }

  const { items, selector, fuente, avisoSiItemPuntua } = escala.definicion;
  const total = escala.total(respuestas);
  const faltan = escala.sinResponder(respuestas);

  return (
    <View style={styles.pantalla}>
      <Cabecera
        titulo={escala.nombre}
        subtitulo={`Llevas ${items.length - faltan.length} de ${items.length}`}
        volver="Escalas"
      />

      {/* Un tramo por ítem: azul respondido, rojo si da el aviso, gris pendiente. */}
      <View style={styles.progreso}>
        {items.map((item) => {
          const respuesta = respuestas[item.id];
          let color = colores.bordeSuave;
          if (respuesta !== undefined) {
            color = respuesta.puntos === avisoSiItemPuntua ? colores.errorBorde : colores.acento;
          }
          return <View key={item.id} style={[styles.tramo, { backgroundColor: color }]} />;
        })}
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.contenedor}>
        {selector !== null && (
          <Tarjeta>
            <Texto variante="etiqueta">¿Qué escala de SpO₂?</Texto>
            <View style={styles.fila}>
              {selector.opciones.map((opcion) => (
                <View key={opcion} style={styles.flex}>
                  <Opcion
                    texto={`Escala ${opcion}`}
                    seleccionada={variante === opcion}
                    alPulsar={() => cambiarVariante(opcion)}
                  />
                </View>
              ))}
            </View>
          </Tarjeta>
        )}

        {items.map((item) => {
          const respuesta = respuestas[item.id];
          const enRojo = respuesta !== undefined && respuesta.puntos === avisoSiItemPuntua;
          return (
            <Tarjeta key={item.id} style={enRojo && styles.tarjetaRoja}>
              <View style={styles.fila}>
                <Texto variante="etiqueta" style={styles.flex}>
                  {item.texto}
                </Texto>
                <View style={styles.insignia}>
                  <Texto variante="nota" style={enRojo && styles.textoRojo}>
                    {respuesta === undefined ? "Sin marcar" : `${respuesta.puntos} pt`}
                  </Texto>
                </View>
              </View>
              {/* Un botón por opción, según la definición (R04F02T01). */}
              <View style={styles.opciones}>
                {escala.opcionesDe(item, variante).map((opcion) => (
                  <Opcion
                    key={opcion.texto}
                    texto={opcion.texto}
                    detalle={`${opcion.puntos} pt`}
                    seleccionada={respuesta?.texto === opcion.texto}
                    alPulsar={() => responder(item.id, opcion)}
                  />
                ))}
              </View>
            </Tarjeta>
          );
        })}

        {escala.parametroRojo(respuestas) && (
          <Mensaje tipo="error">Hay un parámetro con {avisoSiItemPuntua} puntos.</Mensaje>
        )}

        <Texto variante="nota" style={styles.margen}>
          {fuente}
        </Texto>
      </ScrollView>

      <Pie menta>
        <View style={styles.fila}>
          {/* Mientras falte algún ítem se ve la suma parcial, sin interpretar (R04F02T01P02). */}
          <View style={[styles.circulo, total === null && styles.circuloParcial]}>
            <Text style={styles.total}>{total ?? escala.sumaParcial(respuestas)}</Text>
            <Texto variante="nota">{total === null ? "parcial" : "puntos"}</Texto>
          </View>
          <Texto variante="etiqueta" style={[styles.flex, styles.resultado]}>
            {total === null ? "" : escala.interpretar(total)}
          </Texto>
          <Boton texto="Reiniciar" variante="secundario" alPulsar={reiniciar} />
        </View>
      </Pie>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  progreso: { flexDirection: "row", gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  tramo: { flex: 1, height: 8, borderRadius: 4 },
  contenedor: { padding: 16, paddingBottom: 24, gap: 12 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  // Algo más pequeña para que el resultado quepa en dos líneas.
  resultado: { fontSize: 14, lineHeight: 19 },
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tarjetaRoja: {
    backgroundColor: colores.errorFondo,
    borderWidth: 2,
    borderColor: colores.errorBorde,
  },
  insignia: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colores.blanco,
  },
  textoRojo: { color: colores.errorTexto },
  margen: { marginHorizontal: 8 },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  // Borde discontinuo: la suma todavía no es el total.
  circuloParcial: { borderWidth: 2, borderStyle: "dashed", borderColor: colores.borde },
  total: { fontFamily: fuentes.extra, fontSize: 26, lineHeight: 30, color: colores.texto },
});

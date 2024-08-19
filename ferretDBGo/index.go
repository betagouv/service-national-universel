package main

import (
	"context"
	"log"

	"github.com/FerretDB/FerretDB/client"
)

func main() {
	// Configuration de la connexion à FerretDB
	ctx := context.Background()
	clientOptions := client.Options{
		Hosts: []string{"localhost:27017"},
	}

	// Création d'un nouveau client
	ferretClient, err := client.New(ctx, &clientOptions)
	if err != nil {
		log.Fatalf("Erreur lors de la création du client FerretDB: %v", err)
	}

	// Utilisation du client pour interagir avec la base de données
	// Exemple: ping la base de données
	err = ferretClient.Ping(ctx)
	if err != nil {
		log.Fatalf("Erreur lors du ping de la base de données: %v", err)
	}

	log.Println("Connexion à FerretDB réussie!")
}

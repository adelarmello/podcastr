import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList,ActivityIndicator } from 'react-native';


import colors from '../styles/colors';
import fonts from '../styles/fonts';
import {Header} from '../components/Header'
import { EnviromentButton } from '../components/EnviromentButton';
import api from '../services/api';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import { Load } from '../components/Load';

interface EnvironmentProps {
  key: string;
  title: string;
}

interface PlantProps {
  id: string;
  name: string;
  about: string;
  water_tips: string;
  photo: string;
  environments: [string];
  frequency: {
    times: number;
    repeat_every: string;
  }
}

export default function PlantSelect() {
  const [environments, setEnvironments] = useState<EnvironmentProps[]>([]);
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [enviromentSelected, setEnviromentSelected] = useState('all');
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  function handleEnviromentSelected(environment: string) {
    setEnviromentSelected(environment);

    if (environment === 'all')
      return setFilteredPlants(plants);

    const filtered = plants.filter(plant => 
      plant.environments.includes(environment)
    )

    setFilteredPlants(filtered);
  }

  async function fetchPlants(){
    const { data } = await api
    .get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

    if(!data)
      return setLoading(true);

    if (page > 1) {
        setPlants(oldValue => [...oldValue, ...data])
        setFilteredPlants(oldValue => [...oldValue, ...data])
    } else {
        setPlants(data);
        setFilteredPlants(data);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleFetchMore(distance: number) {
    if (distance < 1)
      return;

    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    fetchPlants();
  }


  useEffect(() =>{
    async function fetchEnviroment(){
      const {data} = await api
      .get('plants_environments?_sort=title&_order=asc');

      setEnvironments([
        {
          key: 'all',
          title: 'Todos'
        },
        ...data
      ]);
    }

    fetchEnviroment();

  }, [])

  useEffect(() =>{
    fetchPlants();
  }, [])

  if (loading)
    return <Load />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header />

        <Text style={styles.title} >Em qual ambiente</Text>
        <Text style={styles.subtitle} >você quer colocar sua planta?</Text>
        </View>

        <View>
          <FlatList 
           data={environments}
           renderItem={({item}) =>(
            <EnviromentButton 
              title={item.title}  
              active={item.key === enviromentSelected}
              onPress={() => handleEnviromentSelected(item.key)}
            />
           )}
           horizontal
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={styles.enviromentList}
          />
        </View>

        <View style={styles.plants}>
            <FlatList 
              data={filteredPlants}
              renderItem={({ item }) => (  
                <PlantCardPrimary data={item} />
              )}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              onEndReachedThreshold={0.1}
              onEndReached={({ distanceFromEnd }) => handleFetchMore(distanceFromEnd)}

              ListFooterComponent={
                loadingMore
                ? <ActivityIndicator color={colors.green} />
                : <></>
              }
              
            />

        </View>

        
     </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: 30
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading
  },
  enviromentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    marginVertical: 32,
    //marginLeft: 32,
  },
  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center'
  }
})
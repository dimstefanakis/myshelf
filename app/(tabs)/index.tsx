
import { Text, View } from '@/components/Themed';
import TopNavBar from '@/components/topNavBar';
import HomepageContainer from '@/components/homepageContainers';

export default function TabOneScreen() {
  return (
    <View style={{height:"100%",backgroundColor:"white",display:"flex",alignContent:"center",width:"100%"}} >
      <TopNavBar />
      <HomepageContainer />
    </View>
  );
}


